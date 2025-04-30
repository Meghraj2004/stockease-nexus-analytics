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
import { Download, FileText, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatToRupees } from "@/types/inventory";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [exportLoading, setExportLoading] = useState(false);

  // Sample data - in a real app, this would be fetched from your database
  const monthlySalesData = [
    { name: "Jan", sales: 400000 },
    { name: "Feb", sales: 300000 },
    { name: "Mar", sales: 200000 },
    { name: "Apr", sales: 278000 },
    { name: "May", sales: 189000 },
    { name: "Jun", sales: 239000 },
    { name: "Jul", sales: 349000 },
  ];

  const topProducts = [
    { name: "Product A", value: 40000 },
    { name: "Product B", value: 30000 },
    { name: "Product C", value: 30000 },
    { name: "Product D", value: 20000 },
  ];

  const recentTransactions = [
    {
      id: "1",
      date: "2023-04-23",
      customer: "John Doe",
      items: 3,
      total: 15250,
    },
    {
      id: "2",
      date: "2023-04-22",
      customer: "Jane Smith",
      items: 2,
      total: 8999,
    },
    {
      id: "3",
      date: "2023-04-21",
      customer: "Robert Johnson",
      items: 5,
      total: 21075,
    },
    {
      id: "4",
      date: "2023-04-21",
      customer: "Maria Garcia",
      items: 1,
      total: 4999,
    },
    {
      id: "5",
      date: "2023-04-20",
      customer: "David Chen",
      items: 4,
      total: 17525,
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Custom tooltip formatter for charts to show rupee format
  const formatChartValue = (value: number) => {
    return formatToRupees(value);
  };

  // New function to generate and download PDF report
  const handleExportPDF = () => {
    setExportLoading(true);
    
    // Create a report content as a blob
    const reportTitle = `StockEase Sales Report - ${timeRange} - ${new Date().toLocaleDateString()}`;
    const reportContent = `
      # ${reportTitle}
      
      ## Sales Summary
      Total Sales: ${formatToRupees(1234500)}
      Transactions: 573
      Average Sale: ${formatToRupees(2155)}
      Profit Margin: 24.5%
      
      ## Monthly Sales Data
      ${monthlySalesData.map(item => `${item.name}: ${formatToRupees(item.sales)}`).join('\n')}
      
      ## Top Products
      ${topProducts.map(item => `${item.name}: ${formatToRupees(item.value)}`).join('\n')}
      
      ## Recent Transactions
      ${recentTransactions.map(t => `${t.date} - ${t.customer} - ${t.items} items - ${formatToRupees(t.total)}`).join('\n')}
      
      Report generated on ${new Date().toLocaleString()}
    `;
    
    // Create a blob and download it
    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setExportLoading(false);
      toast({
        title: "Report Downloaded",
        description: "Sales report has been downloaded as PDF",
      });
    }, 1000);
  };

  // New function to generate and download Excel report
  const handleExportExcel = () => {
    setExportLoading(true);
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Month,Sales\n";
    
    // Add data rows
    monthlySalesData.forEach(item => {
      csvContent += `${item.name},${item.sales}\n`;
    });
    
    // Create a URI encoded version of the CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setExportLoading(false);
      toast({
        title: "Report Downloaded",
        description: "Sales report has been downloaded as Excel/CSV",
      });
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Initiated",
      description: "Sales report print dialog opened",
    });
  };

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
                disabled={exportLoading}
              >
                <FileText size={16} />
                <span>PDF</span>
              </Button>
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportExcel}
                disabled={exportLoading}
              >
                <Download size={16} />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handlePrint}
                disabled={exportLoading}
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
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50">
                  <CardTitle className="text-sm font-medium">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatToRupees(1234500)}</div>
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
                  <div className="text-2xl font-bold">+573</div>
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
                  <div className="text-2xl font-bold">{formatToRupees(2155)}</div>
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
                  <div className="text-2xl font-bold">+24.5%</div>
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
                      data={monthlySalesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={formatChartValue} />
                      <Tooltip formatter={formatChartValue} />
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
                        data={topProducts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {topProducts.map((entry, index) => (
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
                    data={[
                      { product: "Product A", sales: 40000, profit: 24000 },
                      { product: "Product B", sales: 30000, profit: 13900 },
                      { product: "Product C", sales: 20000, profit: 8000 },
                      { product: "Product D", sales: 27800, profit: 15000 },
                      { product: "Product E", sales: 18900, profit: 8000 },
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis tickFormatter={formatChartValue} />
                    <Tooltip formatter={(value) => formatToRupees(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" fill="#0ea5e9" name="Sales (₹)" />
                    <Bar dataKey="profit" fill="#22c55e" name="Profit (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="bg-gray-50/50 flex justify-end">
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExportExcel}>
                  <Download size={16} />
                  <span>Export Product Data</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

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
                    {recentTransactions.map((transaction) => (
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
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExportExcel}>
                  <Download size={16} />
                  <span>Export Transactions</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
