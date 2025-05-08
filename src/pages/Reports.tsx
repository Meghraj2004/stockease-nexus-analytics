
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, RefreshCcw, Edit, ClipboardList, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatToRupees } from "@/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import our custom hook for sales report data
import { useSalesReportData } from "@/services/reportsService";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  
  // Use our custom hook to get real-time data
  const { 
    data: reportData, 
    isLoading, 
    error, 
    exportToPDF, 
    exportToExcel,
    exportProductData,
    exportTransactionData,
    updateTransaction
  } = useSalesReportData(timeRange);

  // Filter transactions based on customer search
  const filteredTransactions = reportData?.allTransactions?.filter(transaction => 
    transaction.customer.toLowerCase().includes(customerSearch.toLowerCase())
  ) || [];

  // Handle PDF export
  const handleExportPDF = () => {
    const success = exportToPDF();
    
    if (success) {
      toast({
        title: "Report Downloaded",
        description: "Sales report has been downloaded as PDF",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the PDF report",
      });
    }
  };

  // Handle Excel export
  const handleExportExcel = () => {
    const success = exportToExcel();
    
    if (success) {
      toast({
        title: "Report Downloaded",
        description: "Sales report has been downloaded as Excel file",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the Excel report",
      });
    }
  };
  
  // Handle product data export
  const handleExportProductData = () => {
    const success = exportProductData();
    
    if (success) {
      toast({
        title: "Product Data Downloaded",
        description: "Product sales data has been downloaded as Excel file",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the product data report",
      });
    }
  };
  
  // Handle transaction data export - Updated to clarify it exports ALL transactions
  const handleExportTransactionData = () => {
    const success = exportTransactionData();
    
    if (success) {
      toast({
        title: "All Transactions Downloaded",
        description: "Complete transaction data has been downloaded as Excel file",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the transactions report",
      });
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Initiated",
      description: "Sales report print dialog opened",
    });
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  // Handle save transaction
  const handleSaveTransaction = () => {
    if (!currentTransaction) return;
    
    const success = updateTransaction(currentTransaction);
    if (success) {
      toast({
        title: "Transaction Updated",
        description: "The transaction has been successfully updated",
      });
      setIsEditDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the transaction",
      });
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <RefreshCcw size={40} className="mx-auto animate-spin text-stockease-600" />
            <h2 className="mt-4 text-xl font-medium">Loading Reports Data...</h2>
            <p className="text-muted-foreground">
              Fetching real-time data from Firebase
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-600">Error Loading Reports Data</h2>
            <p className="text-red-500 mt-2">{error}</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => {
                // Force re-render
                setTimeRange(prev => prev === "week" ? "month" : "week");
              }}
            >
              <RefreshCcw size={16} className="mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stockease-600 to-stockease-800">
              Sales Reports
            </h1>
            <p className="text-muted-foreground">
              View and analyze your sales data
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Time Period:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportPDF}
              >
                <FileText size={16} />
                <span>PDF</span>
              </Button>
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportExcel}
              >
                <Download size={16} />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="rounded-md">Overview</TabsTrigger>
            <TabsTrigger value="products" className="rounded-md">Products</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-md">Transactions</TabsTrigger>
            <TabsTrigger value="all-transactions" className="rounded-md">All Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50">
                  <CardTitle className="text-sm font-medium">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatToRupees(reportData.summary.totalSales)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +18% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50/50">
                  <CardTitle className="text-sm font-medium">
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{reportData.summary.transactions}</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-amber-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50/50">
                  <CardTitle className="text-sm font-medium">
                    Average Sale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatToRupees(reportData.summary.averageSale)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50/50">
                  <CardTitle className="text-sm font-medium">
                    Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{reportData.summary.profitMargin.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1 border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>
                    Monthly sales for the current year
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={reportData.monthlySalesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatToRupees(value)} />
                      <Tooltip formatter={(value) => formatToRupees(Number(value))} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1 border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50">
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.topProducts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.topProducts.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatToRupees(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab Content */}
          <TabsContent value="products" className="space-y-4">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50">
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>
                  Sales analysis by product
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={reportData.topProducts.map(product => ({
                      product: product.name,
                      sales: product.value,
                      profit: product.value * 0.4 // Example calculation
                    }))}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis tickFormatter={(value) => formatToRupees(value)} />
                    <Tooltip formatter={(value) => formatToRupees(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" fill="#0ea5e9" name="Sales (₹)" />
                    <Bar dataKey="profit" fill="#22c55e" name="Profit (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="bg-gray-50/50 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={handleExportProductData}
                >
                  <Download size={16} />
                  <span>Export Product Data</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Transactions Tab Content */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100/50">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your most recent sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          #{transaction.id}
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.customer}</TableCell>
                        <TableCell>{transaction.items}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatToRupees(transaction.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="bg-gray-50/50 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={handleExportTransactionData}
                >
                  <Download size={16} />
                  <span>Export All Transactions</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* All Transactions Tab Content */}
          <TabsContent value="all-transactions" className="space-y-4">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50">
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  Complete list of all sales transactions with edit functionality
                </CardDescription>
                <div className="mt-4 relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by customer name..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white dark:bg-gray-900">
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              #{transaction.id}
                            </TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell className="font-medium text-blue-600">
                              {transaction.customer}
                            </TableCell>
                            <TableCell>{transaction.items}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatToRupees(transaction.total)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditTransaction(transaction)}
                              >
                                <Edit size={16} className="text-blue-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <ClipboardList size={40} className="mx-auto text-gray-300 mb-2" />
                            {customerSearch ? (
                              <p className="text-muted-foreground">No transactions found for customer "{customerSearch}"</p>
                            ) : (
                              <p className="text-muted-foreground">No transaction records found for the selected time period</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredTransactions.length} out of {reportData.allTransactions?.length || 0} transactions found
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={handleExportTransactionData}
                >
                  <Download size={16} />
                  <span>Export All Transactions</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {currentTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction-id" className="text-right">
                  ID
                </Label>
                <Input
                  id="transaction-id"
                  value={currentTransaction.id}
                  className="col-span-3"
                  readOnly
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="transaction-date"
                  value={currentTransaction.date}
                  className="col-span-3"
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    date: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction-customer" className="text-right">
                  Customer
                </Label>
                <Input
                  id="transaction-customer"
                  value={currentTransaction.customer}
                  className="col-span-3"
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    customer: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction-items" className="text-right">
                  Items
                </Label>
                <Input
                  id="transaction-items"
                  type="number"
                  value={currentTransaction.items}
                  className="col-span-3"
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    items: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction-total" className="text-right">
                  Total
                </Label>
                <Input
                  id="transaction-total"
                  type="number"
                  value={currentTransaction.total}
                  className="col-span-3"
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    total: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTransaction}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Reports;
