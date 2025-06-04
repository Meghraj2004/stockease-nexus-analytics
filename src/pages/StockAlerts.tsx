
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { InventoryItem, formatToRupees } from "@/types/inventory";
import { AlertTriangle, Search, Package, ShoppingCart } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where,
  onSnapshot 
} from "firebase/firestore";

const StockAlerts = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Query for low stock items (quantity <= reorderLevel but > 0)
    const lowStockQuery = query(
      collection(db, "inventory"),
      where("quantity", ">", 0)
    );

    // Query for out of stock items (quantity = 0)
    const outOfStockQuery = query(
      collection(db, "inventory"),
      where("quantity", "==", 0)
    );

    const unsubscribeLowStock = onSnapshot(
      lowStockQuery,
      (querySnapshot) => {
        const items: InventoryItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const item = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as InventoryItem;
          
          // Filter for items where quantity <= reorderLevel
          if (item.quantity <= item.reorderLevel) {
            items.push(item);
          }
        });
        
        setLowStockItems(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching low stock items:", error);
        toast({
          title: "Error",
          description: "Failed to load stock alerts.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );

    const unsubscribeOutOfStock = onSnapshot(
      outOfStockQuery,
      (querySnapshot) => {
        const items: InventoryItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as InventoryItem);
        });
        
        setOutOfStockItems(items);
      },
      (error) => {
        console.error("Error fetching out of stock items:", error);
        toast({
          title: "Error",
          description: "Failed to load out of stock items.",
          variant: "destructive",
        });
      }
    );

    return () => {
      unsubscribeLowStock();
      unsubscribeOutOfStock();
    };
  }, [toast]);

  const allAlerts = [...outOfStockItems, ...lowStockItems];
  
  const filteredAlerts = allAlerts.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertBadge = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (item.quantity <= item.reorderLevel) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    }
    return null;
  };

  const getAlertPriority = (item: InventoryItem) => {
    if (item.quantity === 0) return "High";
    if (item.quantity <= Math.ceil(item.reorderLevel * 0.5)) return "Medium";
    return "Low";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Alerts</h1>
          <p className="text-muted-foreground">
            Monitor low stock and out-of-stock items
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Out of Stock</h3>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Low Stock</h3>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Total Alerts</h3>
                <p className="text-2xl font-bold text-blue-600">{allAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Value at Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-2" />
                      <h3 className="text-lg font-medium">No stock alerts</h3>
                      <p>All items are adequately stocked.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.quantity === 0 ? "text-red-600 font-bold" : "text-yellow-600 font-medium"}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{item.reorderLevel}</TableCell>
                    <TableCell>{getAlertBadge(item)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getPriorityColor(getAlertPriority(item))}`}>
                        {getAlertPriority(item)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatToRupees(item.price * item.reorderLevel)}
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

export default StockAlerts;
