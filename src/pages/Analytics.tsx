
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
import { formatToRupees } from "@/types/inventory";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

// Import our custom hooks for real-time data
import {
  useMonthlySalesData,
  useCategoryData,
  useProductPerformance,
  useDailySales,
  useAnalyticsSummary
} from "@/services/analyticsService";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("year");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Use our custom hooks to get real-time data
  const { 
    data: monthlySales, 
    isLoading: salesLoading, 
    error: salesError 
  } = useMonthlySalesData(timeRange);
  
  const { 
    data: categoryData, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useCategoryData();
  
  const { 
    data: productPerformance, 
    isLoading: productLoading, 
    error: productError 
  } = useProductPerformance();
  
  const { 
    data: salesByDay, 
    isLoading: dailyLoading, 
    error: dailyError 
  } = useDailySales();
  
  const { 
    data: analyticsSummary, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useAnalyticsSummary();

  // Calculate last refreshed time
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Update last refreshed time when any data changes
  useEffect(() => {
    setLastRefreshed(new Date());
  }, [monthlySales, categoryData, productPerformance, salesByDay, analyticsSummary]);
  
  // Function to refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Our hooks already have real-time listeners, but we can 
    // force a UI refresh to show the loading indicator
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date());
      
      toast({
        title: "Data Refreshed",
        description: `Analytics data was updated at ${new Date().toLocaleTimeString()}`,
      });
    }, 1000);
  };
  
  // Export analytics as PDF
  const handleExportPDF = () => {
    setExportLoading(true);
    
    try {
      const doc = new jsPDF();
      const reportTitle = `StockEase Analytics Report - ${timeRange} - ${new Date().toLocaleDateString()}`;
      
      // Add title
      doc.setFontSize(18);
      doc.text(reportTitle, 14, 20);
      
      // Add summary section
      doc.setFontSize(14);
      doc.text("Overall Performance", 14, 30);
      doc.setFontSize(10);
      doc.text(`Total Revenue: ${formatToRupees(analyticsSummary.totalRevenue)}`, 14, 40);
      doc.text(`Profit Margin: ${analyticsSummary.profitMargin}%`, 14, 45);
      doc.text(`Average Order Value: ${formatToRupees(analyticsSummary.averageOrderValue)}`, 14, 50);
      doc.text(`Conversion Rate: ${analyticsSummary.conversionRate}%`, 14, 55);
      
      // Add monthly sales table
      doc.setFontSize(14);
      doc.text("Monthly Sales", 14, 65);
      
      const monthlySalesRows = monthlySales.map(item => [
        item.name, 
        formatToRupees(item.value)
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: 70,
        head: [["Month", "Value"]],
        body: monthlySalesRows,
      });
      
      // Add category distribution table
      const currentY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Category Distribution", 14, currentY);
      
      const categoryRows = categoryData.map(item => [
        item.name, 
        `${item.value}%`
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: currentY + 5,
        head: [["Category", "Percentage"]],
        body: categoryRows,
      });
      
      // Add daily sales table
      const dailyY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Daily Sales", 14, dailyY);
      
      const dailyRows = salesByDay.map(item => [
        item.name,
        formatToRupees(item.sales)
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: dailyY + 5,
        head: [["Day", "Sales"]],
        body: dailyRows,
      });
      
      // Add product performance table
      const productY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Product Performance", 14, productY);
      
      const productRows = productPerformance.map(item => [
        item.name,
        formatToRupees(item.revenue),
        formatToRupees(item.cost),
        formatToRupees(item.profit)
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: productY + 5,
        head: [["Product", "Revenue", "Cost", "Profit"]],
        body: productRows,
      });
      
      // Add footer
      doc.setFontSize(10);
      doc.text(`Report generated on ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
      doc.text(`Last data refresh: ${lastRefreshed.toLocaleString()}`, 14, doc.internal.pageSize.height - 15);
      
      // Save the PDF
      doc.save(`analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setTimeout(() => {
        setExportLoading(false);
        toast({
          title: "Analytics Report Downloaded",
          description: "Report has been downloaded as PDF",
        });
      }, 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setExportLoading(false);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the PDF report",
      });
    }
  };
  
  // Export analytics as Excel/CSV
  const handleExportExcel = () => {
    setExportLoading(true);
    
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Monthly sales worksheet
      const monthlySalesData = monthlySales.map(item => ({
        Month: item.name,
        Value: item.value
      }));
      
      const mSheet = XLSX.utils.json_to_sheet(monthlySalesData);
      XLSX.utils.book_append_sheet(wb, mSheet, "Monthly Sales");
      
      // Category worksheet
      const categorySheetData = categoryData.map(item => ({
        Category: item.name,
        Percentage: `${item.value}%`
      }));
      
      const cSheet = XLSX.utils.json_to_sheet(categorySheetData);
      XLSX.utils.book_append_sheet(wb, cSheet, "Category Distribution");
      
      // Daily sales worksheet
      const dailySheetData = salesByDay.map(item => ({
        Day: item.name,
        Sales: item.sales
      }));
      
      const dSheet = XLSX.utils.json_to_sheet(dailySheetData);
      XLSX.utils.book_append_sheet(wb, dSheet, "Daily Sales");
      
      // Product performance worksheet
      const productSheetData = productPerformance.map(item => ({
        Product: item.name,
        Revenue: item.revenue,
        Cost: item.cost,
        Profit: item.profit
      }));
      
      const pSheet = XLSX.utils.json_to_sheet(productSheetData);
      XLSX.utils.book_append_sheet(wb, pSheet, "Product Performance");
      
      // Summary worksheet
      const summaryData = [
        { Metric: "Total Revenue", Value: analyticsSummary.totalRevenue },
        { Metric: "Profit Margin", Value: `${analyticsSummary.profitMargin}%` },
        { Metric: "Average Order Value", Value: analyticsSummary.averageOrderValue },
        { Metric: "Conversion Rate", Value: `${analyticsSummary.conversionRate}%` }
      ];
      
      const sSheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, sSheet, "Summary");
      
      // Generate and save the file
      XLSX.writeFile(wb, `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setTimeout(() => {
        setExportLoading(false);
        toast({
          title: "Analytics Report Downloaded",
          description: "Report has been downloaded as Excel/CSV",
        });
      }, 500);
    } catch (error) {
      console.error("Error generating Excel:", error);
      setExportLoading(false);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the Excel report",
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Show loading state if multiple data sources are loading
  if (salesLoading && categoryLoading && productLoading && dailyLoading && summaryLoading) {
    return (
      <AdminRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <RefreshCcw size={40} className="mx-auto animate-spin text-stockease-600" />
              <h2 className="mt-4 text-xl font-medium">Loading Analytics Data...</h2>
              <p className="text-muted-foreground">
                Fetching real-time data from Firebase
              </p>
            </div>
          </div>
        </DashboardLayout>
      </AdminRoute>
    );
  }

  // Show error state if any data source has an error
  const hasError = salesError || categoryError || productError || dailyError || summaryError;
  if (hasError) {
    return (
      <AdminRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-600">Error Loading Analytics Data</h2>
              <p className="text-red-500 mt-2">
                {salesError || categoryError || productError || dailyError || summaryError}
              </p>
              <Button 
                variant="default" 
                className="mt-4"
                onClick={refreshData}
              >
                <RefreshCcw size={16} className="mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AdminRoute>
    );
  }

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
                <div className="text-2xl font-bold">{formatToRupees(analyticsSummary.totalRevenue)}</div>
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
                <div className="text-2xl font-bold">{analyticsSummary.profitMargin}%</div>
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
                <div className="text-2xl font-bold">{formatToRupees(analyticsSummary.averageOrderValue)}</div>
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
                <div className="text-2xl font-bold">{analyticsSummary.conversionRate}%</div>
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
                    {salesLoading ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <RefreshCcw className="animate-spin text-stockease-600" />
                      </div>
                    ) : (
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
                          <YAxis tickFormatter={(value) => formatToRupees(value)} />
                          <Tooltip formatter={(value) => [formatToRupees(Number(value)), 'Revenue']} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#0ea5e9"
                            fill="#0ea5e9"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
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
                    {categoryLoading ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <RefreshCcw className="animate-spin text-stockease-600" />
                      </div>
                    ) : (
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
                    )}
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
                  {dailyLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <RefreshCcw className="animate-spin text-stockease-600" />
                    </div>
                  ) : (
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
                        <YAxis tickFormatter={(value) => formatToRupees(value)} />
                        <Tooltip formatter={(value) => [formatToRupees(Number(value)), 'Sales']} />
                        <Legend />
                        <Bar dataKey="sales" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
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
                  {productLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <RefreshCcw className="animate-spin text-stockease-600" />
                    </div>
                  ) : (
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
                        <YAxis tickFormatter={(value) => formatToRupees(value)} />
                        <Tooltip formatter={(value) => [formatToRupees(Number(value)), '']} />
                        <Legend />
                        <Bar dataKey="revenue" stackId="a" fill="#0ea5e9" name="Revenue" />
                        <Bar dataKey="cost" stackId="a" fill="#ef4444" name="Cost" />
                        <Bar dataKey="profit" fill="#22c55e" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
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
