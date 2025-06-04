
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatToRupees } from "@/types/inventory";
import { Plus, Search, Eye, Package } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  Timestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  totalAmount: number;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  orderDate: Date;
  expectedDate: Date;
  createdAt: Date;
}

const PurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<PurchaseOrder>>({
    orderNumber: `PO-${Date.now()}`,
    supplier: "",
    status: "pending",
    totalAmount: 0,
    items: [],
    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "purchaseOrders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        const fetchedOrders: PurchaseOrder[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedOrders.push({
            id: doc.id,
            ...data,
            orderDate: data.orderDate?.toDate() || new Date(),
            expectedDate: data.expectedDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
          } as PurchaseOrder);
        });
        
        setOrders(fetchedOrders);
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Error fetching purchase orders:", error);
        toast({
          title: "Error",
          description: "Failed to load purchase orders.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [toast]);

  const handleAddOrder = async () => {
    try {
      const currentTime = Timestamp.now();
      
      await addDoc(collection(db, "purchaseOrders"), {
        ...newOrder,
        orderDate: currentTime,
        expectedDate: Timestamp.fromDate(newOrder.expectedDate!),
        createdAt: currentTime,
      });
      
      setNewOrder({
        orderNumber: `PO-${Date.now()}`,
        supplier: "",
        status: "pending",
        totalAmount: 0,
        items: [],
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      
      setAddDialogOpen(false);
      
      toast({
        title: "Purchase Order Created",
        description: "The purchase order has been created successfully.",
      });
    } catch (error) {
      console.error("Error adding purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to create purchase order.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, "purchaseOrders", orderId);
      await updateDoc(orderRef, { status });
      
      toast({
        title: "Status Updated",
        description: "Purchase order status has been updated.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-blue-600 bg-blue-50';
      case 'received': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier deliveries
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for suppliers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="orderNumber" className="text-right">
                    Order #
                  </Label>
                  <Input
                    id="orderNumber"
                    value={newOrder.orderNumber}
                    onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">
                    Supplier
                  </Label>
                  <Input
                    id="supplier"
                    value={newOrder.supplier}
                    onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newOrder.totalAmount}
                    onChange={(e) => setNewOrder({ ...newOrder, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddOrder}>Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-2" />
                      <h3 className="text-lg font-medium">No purchase orders found</h3>
                      <p>Create your first purchase order to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">{formatToRupees(order.totalAmount)}</TableCell>
                    <TableCell>{order.expectedDate.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrders;
