
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
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, serverTimestamp, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { InventoryItem, formatToRupees } from "@/types/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
  const [recentSales, setRecentSales] = useState<any[]>([]);
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
  
  // Fetch recent sales
  useEffect(() => {
    const q = query(
      collection(db, "sales"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const salesData: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        salesData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      
      setRecentSales(salesData);
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
      // Save transaction to Firestore
      await addDoc(collection(db, "sales"), {
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
      });
      
      toast({
        title: "Sale Complete",
        description: `Sale of ${formatToRupees(total)} has been processed successfully.`,
      });
      
      // Reset form
      setItems([]);
      setCustomerName("");
      setDiscount("0");
    } catch (error) {
      console.error("Error processing sale:", error);
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
            
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Last 5 sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSales.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No recent sales
                    </p>
                  ) : (
                    recentSales.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{sale.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium">{formatToRupees(sale.total)}</p>
                      </div>
                    ))
                  )}
                </div>
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
                      Complete Sale
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
