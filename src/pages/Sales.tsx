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
import { ShoppingCart, Plus, Trash2, FileText } from "lucide-react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import { generateInvoicePDF } from "@/services/invoiceService";

interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Transaction {
  id: string;
  customerName: string;
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
  const [discount, setDiscount] = useState("0");
  const [vatRate, setVatRate] = useState("18"); // GST in India is commonly 18%
  const [isProcessing, setIsProcessing] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const transactionsPerPage = 10;
  const { toast } = useToast();
  
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
          customerName: data.customerName || "Walk-in Customer"
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const discountAmount = (subtotal * parseFloat(discount || "0")) / 100;
  const afterDiscount = subtotal - discountAmount;
  
  const vatAmount = (afterDiscount * parseFloat(vatRate || "0")) / 100;
  const total = afterDiscount + vatAmount;

  // Modified to use the imported generateInvoicePDF function
  const handleGenerateInvoice = (saleData: any) => {
    try {
      const success = generateInvoicePDF(saleData);
      
      if (success) {
        toast({
          title: "Invoice Generated",
          description: "The invoice PDF has been successfully generated.",
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
        
        // Create the sale document
        const saleData = {
          customerName: customerName || "Walk-in Customer",
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
      
      // Generate PDF invoice using our service
      handleGenerateInvoice(saleData);
      
      toast({
        title: "Sale Complete",
        description: `Sale of ${formatToRupees(total)} has been processed successfully and inventory has been updated.`,
      });
      
      // Reset form
      setItems([]);
      setCustomerName("");
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
          <h1 className="text-3xl font-bold">New Sale</h1>
          <p className="text-muted-foreground">
            Process a new sales transaction
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
                <CardDescription>
                  Add items to the current sale
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
                        <TableHead>Action</TableHead>
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleGenerateInvoice(transaction)}
                              >
                                <FileText className="h-4 w-4 mr-1" /> Invoice
                              </Button>
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
                <CardTitle>Sale Details</CardTitle>
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
              <CardFooter>
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
                      Complete Sale & Generate Invoice
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
