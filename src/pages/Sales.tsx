
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Plus, Trash2, FileText, Mail, Send, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  Timestamp, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  updateDoc,
  getDoc,
  runTransaction,
  limit,
  getDocs
} from "firebase/firestore";
import { InventoryItem, formatToRupees } from "@/types/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { generateInvoicePDF, sendInvoiceToWhatsApp, sendInvoiceByEmail } from "@/services/invoiceService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Transaction {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  timestamp: Date;
  total: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
}

const Sales = () => {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [discount, setDiscount] = useState("0");
  const [vatRate, setVatRate] = useState("18"); // GST in India is commonly 18%
  const [isProcessing, setIsProcessing] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const transactionsPerPage = 10;
  const { toast } = useToast();
  
  // Edit transaction states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string>("");
  
  // Fetch inventory items for the dropdown
  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems: InventoryItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedItems.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as InventoryItem);
      });
      
      setInventoryItems(fetchedItems);
    }, (error) => {
      console.error("Error fetching inventory items:", error);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch all transactions
  useEffect(() => {
    const q = query(
      collection(db, "sales"),
      orderBy("timestamp", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const salesData: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        salesData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          customerName: data.customerName || "Walk-in Customer",
          customerPhone: data.customerPhone || "",
          customerEmail: data.customerEmail || ""
        } as Transaction);
      });
      
      setAllTransactions(salesData);
      setTotalPages(Math.max(1, Math.ceil(salesData.length / transactionsPerPage)));
    });
    
    return () => unsubscribe();
  }, []);

  const addItem = () => {
    if (!selectedItem) return;
    
    const inventoryItem = inventoryItems.find(item => item.id === selectedItem);
    if (!inventoryItem) return;
    
    const quantity = parseInt(newItemQuantity) || 1;
    
    const newItem = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      price: inventoryItem.price,
      quantity: quantity,
    };
    
    setItems([...items, newItem]);
    setSelectedItem("");
    setNewItemQuantity("1");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Start editing transaction
  const startEditTransaction = (transaction: Transaction) => {
    setIsEditMode(true);
    setEditingTransaction(transaction);
    setEditingTransactionId(transaction.id);
    
    // Populate form with transaction data
    setCustomerName(transaction.customerName);
    setCustomerPhone(transaction.customerPhone || "");
    setCustomerEmail(transaction.customerEmail || "");
    setDiscount(transaction.discount.toString());
    setVatRate(transaction.vatRate.toString());
    
    // Map transaction items to sale items
    const saleItems: SaleItem[] = transaction.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    setItems(saleItems);
    
    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingTransaction(null);
    setEditingTransactionId("");
    
    // Reset form
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setDiscount("0");
    setVatRate("18");
  };

  // Save edited transaction
  const saveEditedTransaction = async () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items before saving the transaction.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const updatedSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      
      const updatedDiscountAmount = (updatedSubtotal * parseFloat(discount || "0")) / 100;
      const afterDiscount = updatedSubtotal - updatedDiscountAmount;
      
      const updatedVatAmount = (afterDiscount * parseFloat(vatRate || "0")) / 100;
      const updatedTotal = afterDiscount + updatedVatAmount;
      
      // Update the transaction in Firestore
      const transactionRef = doc(db, "sales", editingTransactionId);
      
      const updatedTransactionData = {
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal: updatedSubtotal,
        discount: parseFloat(discount || "0"),
        discountAmount: updatedDiscountAmount,
        vatRate: parseFloat(vatRate || "0"),
        vatAmount: updatedVatAmount,
        total: updatedTotal,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(transactionRef, updatedTransactionData);
      
      toast({
        title: "Transaction Updated",
        description: "The transaction has been successfully updated.",
      });
      
      // Exit edit mode
      cancelEdit();
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const discountAmount = (subtotal * parseFloat(discount || "0")) / 100;
  const afterDiscount = subtotal - discountAmount;
  
  const vatAmount = (afterDiscount * parseFloat(vatRate || "0")) / 100;
  const total = afterDiscount + vatAmount;

  // Handle PDF generation
  const handleGenerateInvoice = (saleData: any) => {
    try {
      const success = generateInvoicePDF(saleData);
      
      if (success) {
        toast({
          title: "Invoice Generated",
          description: "The invoice PDF has been successfully generated and downloaded.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate invoice PDF. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle WhatsApp message sending
  const handleSendWhatsApp = (saleData: any) => {
    try {
      const success = sendInvoiceToWhatsApp(saleData);
      
      if (success) {
        toast({
          title: "WhatsApp Message Prepared",
          description: "WhatsApp will open with the invoice details.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to prepare WhatsApp message. Please check the phone number.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle Email sending
  const handleSendEmail = (saleData: any) => {
    try {
      const success = sendInvoiceByEmail(saleData);
      
      if (success) {
        toast({
          title: "Email Prepared",
          description: "Your email client will open with the invoice details.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to prepare email. Please check the email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processSale = async () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items to the cart before completing the sale.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Variables to store sale data for PDF generation
      let saleId = '';
      const currentTimestamp = new Date();
      
      // Start a transaction to ensure both sale creation and inventory update succeed or fail together
      await runTransaction(db, async (transaction) => {
        // First check if we have enough inventory for each item
        const inventoryChecks = await Promise.all(
          items.map(async (item) => {
            const inventoryRef = doc(db, "inventory", item.id);
            const inventoryDoc = await transaction.get(inventoryRef);
            
            if (!inventoryDoc.exists()) {
              throw new Error(`Product ${item.name} no longer exists in inventory`);
            }
            
            const currentQuantity = inventoryDoc.data().quantity;
            if (currentQuantity < item.quantity) {
              throw new Error(`Not enough ${item.name} in stock. Only ${currentQuantity} available.`);
            }
            
            return { ref: inventoryRef, currentQuantity };
          })
        );
        
        // Create the sale document with customer contact info
        const saleData = {
          customerName: customerName || "Walk-in Customer",
          customerPhone: customerPhone || "",
          customerEmail: customerEmail || "",
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          })),
          subtotal,
          discount: parseFloat(discount || "0"),
          discountAmount,
          vatRate: parseFloat(vatRate || "0"),
          vatAmount,
          total,
          timestamp: serverTimestamp(),
          createdBy: "user_id", // This would be replaced by the actual user ID
        };
        
        // Add the sale document
        const saleRef = doc(collection(db, "sales"));
        saleId = saleRef.id; // Store the ID for later use
        transaction.set(saleRef, saleData);
        
        // Update inventory quantities for each item
        items.forEach((item, index) => {
          const { ref, currentQuantity } = inventoryChecks[index];
          const newQuantity = currentQuantity - item.quantity;
          
          transaction.update(ref, { 
            quantity: newQuantity,
            updatedAt: serverTimestamp()
          });
        });
      });

      // Prepare sale data for PDF generation (after the transaction)
      const saleData = {
        id: saleId,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal,
        discount: parseFloat(discount || "0"),
        discountAmount,
        vatRate: parseFloat(vatRate || "0"),
        vatAmount,
        total,
        timestamp: currentTimestamp,
      };
      
      // Generate PDF invoice and send to WhatsApp if phone number is provided
      handleGenerateInvoice(saleData);
      
      if (customerPhone) {
        handleSendWhatsApp(saleData);
      }
      
      if (customerEmail) {
        handleSendEmail(saleData);
      }
      
      toast({
        title: "Sale Complete",
        description: `Sale of ${formatToRupees(total)} has been processed successfully and inventory has been updated.`,
      });
      
      // Reset form
      setItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setDiscount("0");
    } catch (error: any) {
      console.error("Error processing sale:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get current page transactions
  const currentTransactions = allTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );
  
  // Helper function to generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Transaction" : "New Sale"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? "Update an existing sales transaction" 
              : "Process a new sales transaction"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
                <CardDescription>
                  {isEditMode ? "Edit items in this transaction" : "Add items to the current sale"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Select
                      value={selectedItem}
                      onValueChange={setSelectedItem}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {formatToRupees(item.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Qty"
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="w-20"
                  />
                  <Button onClick={addItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border rounded-md">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No items added yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatToRupees(item.price)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* All Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  View all previous sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {transaction.timestamp.toLocaleDateString()}
                            </TableCell>
                            <TableCell>{transaction.customerName}</TableCell>
                            <TableCell>{formatToRupees(transaction.total)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleGenerateInvoice(transaction)}
                                  title="Download Invoice"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {transaction.customerPhone && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleSendWhatsApp(transaction)}
                                    title="Send to WhatsApp"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                )}
                                {transaction.customerEmail && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleSendEmail(transaction)}
                                    title="Send Email"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditTransaction(transaction)}
                                  title="Edit Transaction"
                                  disabled={isEditMode}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {allTransactions.length > 0 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {getPageNumbers().map(number => (
                          <PaginationItem key={number}>
                            <PaginationLink 
                              isActive={currentPage === number}
                              onClick={() => setCurrentPage(number)}
                            >
                              {number}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEditMode ? "Edit Transaction Details" : "Sale Details"}</CardTitle>
                <CardDescription>
                  Customer information and payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Customer Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">For WhatsApp invoice delivery</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Customer Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">For email invoice delivery</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vat">GST Rate (%)</Label>
                  <Input
                    id="vat"
                    type="number"
                    min="0"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                  />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatToRupees(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount ({discount}%):</span>
                    <span>-{formatToRupees(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST ({vatRate}%):</span>
                    <span>{formatToRupees(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatToRupees(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className={isEditMode ? "flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between" : ""}>
                {isEditMode ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={cancelEdit}
                      disabled={isProcessing}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="w-full sm:w-auto" 
                      onClick={saveEditedTransaction}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={processSale}
                    disabled={items.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Complete Sale & Send Invoice
                      </span>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
