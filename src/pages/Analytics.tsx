
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AreaChart,
  Area,
} from "recharts";
import AdminRoute from "@/components/AdminRoute";
import { RefreshCcw, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("year");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [exportLoading, setExportLoading] = useState(false);
  
  // Sample data - in a real app, this would come from your database
  const [monthlySales, setMonthlySales] = useState([
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 2000 },
    { name: "Apr", value: 2780 },
    { name: "May", value: 1890 },
    { name: "Jun", value: 2390 },
    { name: "Jul", value: 3490 },
    { name: "Aug", value: 2900 },
    { name: "Sep", value: 3200 },
    { name: "Oct", value: 2800 },
    { name: "Nov", value: 3800 },
    { name: "Dec", value: 4300 },
  ]);

  const [categoryData, setCategoryData] = useState([
    { name: "Electronics", value: 30 },
    { name: "Clothing", value: 25 },
    { name: "Food", value: 20 },
    { name: "Books", value: 15 },
    { name: "Other", value: 10 },
  ]);

  const [salesByDay, setSalesByDay] = useState([
    { name: "Mon", sales: 1000 },
    { name: "Tue", sales: 1200 },
    { name: "Wed", sales: 1500 },
    { name: "Thu", sales: 1300 },
    { name: "Fri", sales: 1700 },
    { name: "Sat", sales: 2100 },
    { name: "Sun", sales: 1800 },
  ]);

  const [productPerformance, setProductPerformance] = useState([
    { name: "Product A", revenue: 4000, profit: 2400, cost: 1600 },
    { name: "Product B", revenue: 3000, profit: 1398, cost: 1602 },
    { name: "Product C", revenue: 2000, profit: 980, cost: 1020 },
    { name: "Product D", revenue: 2780, profit: 1408, cost: 1372 },
    { name: "Product E", revenue: 1890, profit: 800, cost: 1090 },
  ]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 300000); // 5 minutes in milliseconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Function to refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Update data with random variations to simulate real-time data changes
      setMonthlySales(prevData => 
        prevData.map(item => ({
          ...item,
          value: item.value * (0.9 + Math.random() * 0.2) // +/- 10% random variation
        }))
      );
      
      setCategoryData(prevData => 
        prevData.map(item => ({
          ...item,
          value: Math.max(5, Math.min(50, item.value * (0.9 + Math.random() * 0.2))) // +/- 10% with bounds
        }))
      );
      
      setSalesByDay(prevData => 
        prevData.map(item => ({
          ...item,
          sales: item.sales * (0.9 + Math.random() * 0.2) // +/- 10% random variation
        }))
      );
      
      setProductPerformance(prevData => 
        prevData.map(item => {
          const revMultiplier = 0.9 + Math.random() * 0.2;
          const revenue = item.revenue * revMultiplier;
          const cost = item.cost * (0.95 + Math.random() * 0.1);
          return {
            ...item,
            revenue,
            cost,
            profit: revenue - cost
          };
        })
      );
      
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      
      toast({
        title: "Data Refreshed",
        description: `Analytics data was updated at ${new Date().toLocaleTimeString()}`,
      });
    }, 1500);
  };
  
  // Export analytics as PDF
  const handleExportPDF = () => {
    setExportLoading(true);
    
    // Create a report content as a blob
    const reportTitle = `StockEase Analytics Report - ${timeRange} - ${new Date().toLocaleDateString()}`;
    const reportContent = `
      # ${reportTitle}
      
      ## Overall Performance
      Total Revenue: $45,231.89
      Profit Margin: 42.3%
      Average Order Value: $52.45
      Conversion Rate: 24.8%
      
      ## Monthly Sales
      ${monthlySales.map(item => `${item.name}: $${item.value}`).join('\n')}
      
      ## Category Distribution
      ${categoryData.map(item => `${item.name}: ${item.value}%`).join('\n')}
      
      ## Daily Sales
      ${salesByDay.map(item => `${item.name}: $${item.sales}`).join('\n')}
      
      ## Product Performance
      ${productPerformance.map(item => 
        `${item.name}: Revenue: $${item.revenue}, Cost: $${item.cost}, Profit: $${item.profit}`
      ).join('\n')}
      
      Report generated on ${new Date().toLocaleString()}
      Last data refresh: ${lastRefreshed.toLocaleString()}
    `;
    
    // Create a blob and download it
    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setExportLoading(false);
      toast({
        title: "Analytics Report Downloaded",
        description: "Report has been downloaded as PDF",
      });
    }, 1000);
  };
  
  // Export analytics as Excel/CSV
  const handleExportExcel = () => {
    setExportLoading(true);
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers and data for monthly sales
    csvContent += "Month,Value\n";
    monthlySales.forEach(item => {
      csvContent += `${item.name},${item.value}\n`;
    });
    
    csvContent += "\nCategory,Percentage\n";
    categoryData.forEach(item => {
      csvContent += `${item.name},${item.value}\n`;
    });
    
    csvContent += "\nDay,Sales\n";
    salesByDay.forEach(item => {
      csvContent += `${item.name},${item.sales}\n`;
    });
    
    csvContent += "\nProduct,Revenue,Cost,Profit\n";
    productPerformance.forEach(item => {
      csvContent += `${item.name},${item.revenue},${item.cost},${item.profit}\n`;
    });
    
    // Create a URI encoded version of the CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setExportLoading(false);
      toast({
        title: "Analytics Report Downloaded",
        description: "Report has been downloaded as Excel/CSV",
      });
    }, 1000);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Detailed insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground mr-2">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData} 
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </Button>
              <span className="text-sm font-medium">Time Period:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-500">+20.1%</span>
                  <div className="text-xs text-muted-foreground">from last period</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42.3%</div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-500">+4.2%</span>
                  <div className="text-xs text-muted-foreground">from last period</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$52.45</div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-red-500">-2.5%</span>
                  <div className="text-xs text-muted-foreground">from last period</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-500">+3.1%</span>
                  <div className="text-xs text-muted-foreground">from last period</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
              <TabsTrigger value="products">Product Performance</TabsTrigger>
              <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>
                      Revenue breakdown by month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={monthlySales}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#0ea5e9"
                          fill="#0ea5e9"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>
                      Revenue distribution across product categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Sales Trend</CardTitle>
                  <CardDescription>
                    Sales performance by day of week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={salesByDay}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                      <Legend />
                      <Bar dataKey="sales" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>
                    Revenue, cost, and profit by product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={productPerformance}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Bar dataKey="revenue" stackId="a" fill="#0ea5e9" name="Revenue" />
                      <Bar dataKey="cost" stackId="a" fill="#ef4444" name="Cost" />
                      <Bar dataKey="profit" fill="#22c55e" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Growth</CardTitle>
                  <CardDescription>
                    New customers over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={monthlySales.map((item) => ({ ...item, customers: Math.round(item.value / 50) }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="New Customers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
};

export default Analytics;
