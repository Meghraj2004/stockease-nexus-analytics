
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatToRupees } from "@/types/inventory";
import { Search, TrendingUp, TrendingDown, Package, Activity } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  Timestamp
} from "firebase/firestore";

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference: string; // Order number, adjustment reference, etc.
  unitPrice?: number;
  totalValue?: number;
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

const StockMovement = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    let q = query(collection(db, "stockMovements"), orderBy("timestamp", "desc"));

    // Apply filters
    if (filterType !== "all") {
      q = query(collection(db, "stockMovements"), 
        where("movementType", "==", filterType),
        orderBy("timestamp", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        const fetchedMovements: StockMovement[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMovements.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as StockMovement);
        });
        
        // Apply date filter
        let filteredMovements = fetchedMovements;
        if (dateFilter !== "all") {
          const now = new Date();
          const filterDate = new Date();
          
          switch (dateFilter) {
            case "today":
              filterDate.setHours(0, 0, 0, 0);
              break;
            case "week":
              filterDate.setDate(now.getDate() - 7);
              break;
            case "month":
              filterDate.setMonth(now.getMonth() - 1);
              break;
          }
          
          filteredMovements = fetchedMovements.filter(
            movement => movement.timestamp >= filterDate
          );
        }
        
        setMovements(filteredMovements);
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Error fetching stock movements:", error);
        toast({
          title: "Error",
          description: "Failed to load stock movements.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [filterType, dateFilter, toast]);

  const filteredMovements = movements.filter(
    (movement) =>
      movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in': return <Badge className="bg-green-100 text-green-800">Stock In</Badge>;
      case 'out': return <Badge className="bg-red-100 text-red-800">Stock Out</Badge>;
      case 'adjustment': return <Badge className="bg-blue-100 text-blue-800">Adjustment</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatQuantityChange = (movement: StockMovement) => {
    const change = movement.newQuantity - movement.previousQuantity;
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    
    return (
      <span className={`font-medium ${color}`}>
        {sign}{change}
      </span>
    );
  };

  // Calculate summary statistics
  const totalIn = movements
    .filter(m => m.movementType === 'in')
    .reduce((sum, m) => sum + m.quantity, 0);
    
  const totalOut = movements
    .filter(m => m.movementType === 'out')
    .reduce((sum, m) => sum + m.quantity, 0);
    
  const totalAdjustments = movements
    .filter(m => m.movementType === 'adjustment')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Movement</h1>
          <p className="text-muted-foreground">
            Track all inventory movements and changes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Stock In</h3>
                <p className="text-2xl font-bold text-green-600">{totalIn}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Stock Out</h3>
                <p className="text-2xl font-bold text-red-600">{totalOut}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Adjustments</h3>
                <p className="text-2xl font-bold text-blue-600">{totalAdjustments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full lg:w-[300px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Stock In</SelectItem>
                <SelectItem value="out">Stock Out</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Previous Qty</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">New Qty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Activity className="h-12 w-12 mb-2" />
                      <h3 className="text-lg font-medium">No stock movements found</h3>
                      <p>Stock movements will appear here as inventory changes occur.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">{movement.itemName}</TableCell>
                    <TableCell>{movement.itemSku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movementType)}
                        {getMovementBadge(movement.movementType)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{movement.previousQuantity}</TableCell>
                    <TableCell className="text-right">
                      {formatQuantityChange(movement)}
                    </TableCell>
                    <TableCell className="text-right font-medium">{movement.newQuantity}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>{movement.reference}</TableCell>
                    <TableCell>{movement.timestamp.toLocaleDateString()}</TableCell>
                    <TableCell>{movement.performedBy}</TableCell>
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

export default StockMovement;
