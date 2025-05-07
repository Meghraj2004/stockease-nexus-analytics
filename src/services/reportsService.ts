
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, where, Timestamp, getDocs, doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { formatToRupees } from "@/types/inventory";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

// Types for reports data
export interface Transaction {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
}

export interface SalesReport {
  monthlySalesData: Array<{name: string, sales: number}>;
  topProducts: Array<{name: string, value: number}>;
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  summary: {
    totalSales: number;
    transactions: number;
    averageSale: number;
    profitMargin: number;
  };
}

// Hook for real-time sales report data
export const useSalesReportData = (timeRange: string) => {
  const [data, setData] = useState<SalesReport>({
    monthlySalesData: [],
    topProducts: [],
    recentTransactions: [],
    allTransactions: [],
    summary: {
      totalSales: 0,
      transactions: 0,
      averageSale: 0,
      profitMargin: 0,
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Calculate date range based on selected time period
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Some date far in the past
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Real-time listener for sales data
    const salesRef = collection(db, "sales");
    const salesQuery = query(
      salesRef,
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(now)),
      orderBy("timestamp", "desc")
    );
    
    try {
      // Set up real-time listener for sales data
      const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
        if (snapshot.empty) {
          // If no data, provide sample data
          provideDefaultData();
          setIsLoading(false);
          return;
        }
        
        // Process sales data
        const processedData = processSalesData(snapshot.docs);
        setData(processedData);
        setIsLoading(false);
      }, (err) => {
        console.error("Error in sales report listener:", err);
        setError(err.message);
        setIsLoading(false);
        provideDefaultData();
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error setting up sales report listeners:", err);
      setError(err.message);
      setIsLoading(false);
      provideDefaultData();
    }
  }, [timeRange]);

  // Helper function to process sales data
  const processSalesData = (docs: any[]) => {
    // Process monthly sales data
    const monthlySales: Record<string, number> = {};
    
    // Process top products data
    const productSales: Record<string, number> = {};
    
    // Process transactions
    const recentTransactions: Transaction[] = [];
    const allTransactions: Transaction[] = [];
    
    let totalSales = 0;
    const transactionCount = docs.length;
    
    docs.forEach((doc, index) => {
      const sale = doc.data();
      const date = sale.timestamp?.toDate();
      
      if (!date) return;
      
      // For monthly sales
      const monthName = date.toLocaleString('default', { month: 'short' });
      if (!monthlySales[monthName]) {
        monthlySales[monthName] = 0;
      }
      monthlySales[monthName] += sale.total || 0;
      
      // For total sales
      totalSales += sale.total || 0;
      
      // For product sales
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          if (!item.name) return;
          
          if (!productSales[item.name]) {
            productSales[item.name] = 0;
          }
          
          productSales[item.name] += item.total || 0;
        });
      }
      
      // Create transaction object for both recent and all transactions
      const transaction = {
        id: doc.id,
        date: date ? date.toISOString().split('T')[0] : '',
        customer: sale.customer || 'Guest',
        items: sale.items?.length || 0,
        total: sale.total || 0,
      };
      
      // For recent transactions (only first 5)
      if (index < 5) {
        recentTransactions.push(transaction);
      }
      
      // For all transactions
      allTransactions.push(transaction);
    });
    
    // Format monthly sales for chart
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySalesData = Object.keys(monthlySales).map(month => ({
      name: month,
      sales: monthlySales[month]
    })).sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    
    // Format top products for chart
    const topProducts = Object.keys(productSales)
      .map(name => ({ name, value: productSales[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    // Calculate summary data
    const averageSale = transactionCount > 0 ? totalSales / transactionCount : 0;
    
    return {
      monthlySalesData,
      topProducts,
      recentTransactions,
      allTransactions,
      summary: {
        totalSales,
        transactions: transactionCount,
        averageSale,
        profitMargin: 40.0 // Using a default profit margin
      }
    };
  };

  // Helper function to provide default sample data
  const provideDefaultData = () => {
    // Sample monthly sales
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySalesData = months.map(month => ({
      name: month,
      sales: Math.floor(Math.random() * 10000) + 5000
    }));
    
    // Sample top products
    const sampleProducts = [
      { name: "Laptop", value: 45000 },
      { name: "Smartphone", value: 35000 },
      { name: "Tablet", value: 25000 },
      { name: "Headphones", value: 15000 },
      { name: "Smartwatch", value: 10000 }
    ];
    
    // Sample transactions
    const sampleTransactions = Array.from({ length: 5 }, (_, i) => ({
      id: `INV${10001 + i}`,
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      customer: `Customer ${i + 1}`,
      items: Math.floor(Math.random() * 5) + 1,
      total: Math.floor(Math.random() * 5000) + 1000
    }));
    
    // Sample all transactions (more data)
    const sampleAllTransactions = Array.from({ length: 20 }, (_, i) => ({
      id: `INV${10001 + i}`,
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      customer: `Customer ${Math.floor(i/2) + 1}`,
      items: Math.floor(Math.random() * 5) + 1,
      total: Math.floor(Math.random() * 5000) + 1000
    }));
    
    // Calculate summary
    const totalSales = monthlySalesData.reduce((sum, item) => sum + item.sales, 0);
    
    setData({
      monthlySalesData,
      topProducts: sampleProducts,
      recentTransactions: sampleTransactions,
      allTransactions: sampleAllTransactions,
      summary: {
        totalSales,
        transactions: 145,
        averageSale: Math.round(totalSales / 145),
        profitMargin: 38.5
      }
    });
  };

  // Update a transaction
  const updateTransaction = (transaction: Transaction) => {
    try {
      // For demo/sample data, just update the local state
      if (!db || data.allTransactions.some(t => t.id.startsWith('INV'))) {
        // We're using sample data, so just update in memory
        setData(prevData => {
          const updatedRecentTransactions = prevData.recentTransactions.map(t => 
            t.id === transaction.id ? transaction : t
          );
          
          const updatedAllTransactions = prevData.allTransactions.map(t => 
            t.id === transaction.id ? transaction : t
          );
          
          return {
            ...prevData,
            recentTransactions: updatedRecentTransactions,
            allTransactions: updatedAllTransactions
          };
        });
        
        console.log("Transaction updated in memory:", transaction);
        return true;
      }
      
      // For real data, update in Firebase
      const transactionRef = doc(db, "sales", transaction.id);
      
      // Prepare the update data
      // Note: We only update fields that are editable from the UI
      const updateData = {
        customer: transaction.customer,
        total: transaction.total,
        // If we had more fields in the form, we would update them here
      };
      
      // Update the document in Firebase
      // Note: This is async, but we don't wait for it here
      updateDoc(transactionRef, updateData)
        .then(() => {
          console.log("Transaction successfully updated in Firebase:", transaction.id);
        })
        .catch((error) => {
          console.error("Error updating transaction:", error);
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "There was an error updating the transaction in the database"
          });
        });
      
      return true;
    } catch (err) {
      console.error("Error updating transaction:", err);
      return false;
    }
  };

  // Enhanced Export functions for reports
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const reportTitle = `Sales Report - ${timeRange} - ${new Date().toLocaleDateString()}`;
      
      // Add title
      doc.setFontSize(18);
      doc.text(reportTitle, 14, 20);
      
      // Add summary section
      doc.setFontSize(14);
      doc.text("Sales Summary", 14, 30);
      doc.setFontSize(10);
      doc.text(`Total Sales: ${formatToRupees(data.summary.totalSales)}`, 14, 40);
      doc.text(`Transactions: ${data.summary.transactions}`, 14, 45);
      doc.text(`Average Sale: ${formatToRupees(data.summary.averageSale)}`, 14, 50);
      doc.text(`Profit Margin: ${data.summary.profitMargin.toFixed(1)}%`, 14, 55);
      
      // Add monthly sales table
      doc.setFontSize(14);
      doc.text("Monthly Sales", 14, 65);
      
      const monthlySalesRows = data.monthlySalesData.map(item => [
        item.name, 
        formatToRupees(item.sales)
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: 70,
        head: [["Month", "Sales"]],
        body: monthlySalesRows,
      });
      
      // Add top products table
      const currentY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Top Products", 14, currentY);
      
      const topProductsRows = data.topProducts.map(item => [
        item.name, 
        formatToRupees(item.value)
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: currentY + 5,
        head: [["Product", "Sales"]],
        body: topProductsRows,
      });
      
      // Add transactions table
      const transY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Recent Transactions", 14, transY);
      
      const transactionRows = data.recentTransactions.map(item => [
        item.date,
        item.customer,
        item.items.toString(),
        formatToRupees(item.total)
      ]);
      
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: transY + 5,
        head: [["Date", "Customer", "Items", "Total"]],
        body: transactionRows,
      });
      
      // Add footer
      doc.setFontSize(10);
      doc.text(`Report generated on ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
      
      // Save the PDF
      doc.save(`sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      return true;
    } catch (err) {
      console.error("Error generating PDF:", err);
      return false;
    }
  };

  // Enhanced Excel export function for more complete and formatted data
  const exportToExcel = () => {
    try {
      // Create workbook with proper formatting
      const wb = XLSX.utils.book_new();
      
      // Create a formatted header for the workbook
      const headerData = [
        [`Sales Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`],
        [`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [],
      ];
      
      // Summary worksheet with detailed information
      const summaryData = [
        ...headerData,
        ["Sales Summary"],
        [],
        ["Metric", "Value"],
        ["Total Sales", formatToRupees(data.summary.totalSales)],
        ["Number of Transactions", data.summary.transactions],
        ["Average Sale Value", formatToRupees(data.summary.averageSale)],
        ["Profit Margin", `${data.summary.profitMargin.toFixed(1)}%`],
        ["Time Period", timeRange.charAt(0).toUpperCase() + timeRange.slice(1)],
        []
      ];
      
      const sSheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, sSheet, "Summary");
      
      // Enhanced Monthly sales worksheet with proper formatting
      const monthlyHeader = [
        ...headerData,
        ["Monthly Sales Breakdown"],
        [],
        ["Month", "Sales Value", "Formatted Value"]
      ];
      
      const monthlySalesData = [
        ...monthlyHeader,
        ...data.monthlySalesData.map(item => [
          item.name,
          item.sales,
          formatToRupees(item.sales)
        ])
      ];
      
      // Add monthly total row
      const monthlyTotal = data.monthlySalesData.reduce((sum, item) => sum + item.sales, 0);
      monthlySalesData.push(
        [],
        ["Total", monthlyTotal, formatToRupees(monthlyTotal)]
      );
      
      const mSheet = XLSX.utils.aoa_to_sheet(monthlySalesData);
      XLSX.utils.book_append_sheet(wb, mSheet, "Monthly Sales");
      
      // Enhanced Top products worksheet with detailed metrics
      const productsHeader = [
        ...headerData,
        ["Top Products by Sales"],
        [],
        ["Product Name", "Sales Value", "Formatted Value", "% of Total Sales"]
      ];
      
      const totalProductSales = data.topProducts.reduce((sum, item) => sum + item.value, 0);
      
      const topProductsData = [
        ...productsHeader,
        ...data.topProducts.map(item => [
          item.name,
          item.value,
          formatToRupees(item.value),
          `${((item.value / totalProductSales) * 100).toFixed(2)}%`
        ])
      ];
      
      // Add total row
      topProductsData.push(
        [],
        ["Total", totalProductSales, formatToRupees(totalProductSales), "100%"]
      );
      
      const pSheet = XLSX.utils.aoa_to_sheet(topProductsData);
      XLSX.utils.book_append_sheet(wb, pSheet, "Top Products");
      
      // Enhanced Transactions worksheet with more detailed information
      const transactionsHeader = [
        ...headerData,
        ["Recent Transactions"],
        [],
        ["Transaction ID", "Date", "Customer", "Number of Items", "Total Value", "Formatted Total"]
      ];
      
      const transactionsData = [
        ...transactionsHeader,
        ...data.recentTransactions.map(item => [
          item.id,
          item.date,
          item.customer,
          item.items,
          item.total,
          formatToRupees(item.total)
        ])
      ];
      
      // Add transactions summary
      const transTotal = data.recentTransactions.reduce((sum, item) => sum + item.total, 0);
      transactionsData.push(
        [],
        ["Transactions Total", "", "", "", transTotal, formatToRupees(transTotal)]
      );
      
      const tSheet = XLSX.utils.aoa_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, tSheet, "Transactions");
      
      // Apply some cell formatting - column widths
      const setColumnWidths = (ws: XLSX.WorkSheet) => {
        const cols = [
          { wch: 20 }, // Column A width
          { wch: 20 }, // Column B width
          { wch: 25 }, // Column C width
          { wch: 15 }, // Column D width
          { wch: 15 }, // Column E width
          { wch: 20 }, // Column F width
        ];
        ws['!cols'] = cols;
      };
      
      setColumnWidths(sSheet);
      setColumnWidths(mSheet);
      setColumnWidths(pSheet);
      setColumnWidths(tSheet);
      
      // Generate the Excel file with a descriptive filename
      const fileName = `sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log(`Successfully exported report to ${fileName}`);
      return true;
    } catch (err) {
      console.error("Error generating Excel:", err);
      return false;
    }
  };
  
  // Export specific product data with more detailed information
  const exportProductData = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create header with report information
      const headerData = [
        [`Product Sales Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`],
        [`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [],
      ];
      
      // Product data with enhanced details
      const productsHeader = [
        ...headerData,
        ["Product Performance Analysis"],
        [],
        [
          "Product Name", 
          "Sales Value", 
          "Formatted Value", 
          "% of Total Sales", 
          "Estimated Profit", 
          "Profit Margin"
        ]
      ];
      
      const totalProductSales = data.topProducts.reduce((sum, item) => sum + item.value, 0);
      
      const productDetails = [
        ...productsHeader,
        ...data.topProducts.map(item => {
          const salesValue = item.value;
          const percentOfTotal = (salesValue / totalProductSales) * 100;
          const estimatedProfit = salesValue * (data.summary.profitMargin / 100);
          
          return [
            item.name,
            salesValue,
            formatToRupees(salesValue),
            `${percentOfTotal.toFixed(2)}%`,
            formatToRupees(estimatedProfit),
            `${data.summary.profitMargin.toFixed(1)}%`
          ];
        })
      ];
      
      // Add summary row
      productDetails.push(
        [],
        [
          "Total", 
          totalProductSales, 
          formatToRupees(totalProductSales), 
          "100%",
          formatToRupees(totalProductSales * (data.summary.profitMargin / 100)),
          `${data.summary.profitMargin.toFixed(1)}%`
        ]
      );
      
      const sheet = XLSX.utils.aoa_to_sheet(productDetails);
      
      // Set column widths for better readability
      sheet['!cols'] = [
        { wch: 25 }, // Product name
        { wch: 15 }, // Sales value
        { wch: 20 }, // Formatted value
        { wch: 15 }, // % of total
        { wch: 18 }, // Estimated profit
        { wch: 15 }, // Profit margin
      ];
      
      XLSX.utils.book_append_sheet(wb, sheet, "Product Analysis");
      
      // Generate file with specific name for product report
      const fileName = `product-sales-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log(`Successfully exported product report to ${fileName}`);
      return true;
    } catch (err) {
      console.error("Error generating product report:", err);
      return false;
    }
  };
  
  // Export transactions with enhanced details
  const exportTransactionData = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create header with report information
      const headerData = [
        [`Transactions Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`],
        [`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [],
      ];
      
      // More detailed transaction data export
      const transactionsHeader = [
        ...headerData,
        ["Detailed Transaction Analysis"],
        [],
        [
          "Transaction ID", 
          "Date", 
          "Customer", 
          "Items Count", 
          "Amount", 
          "Formatted Amount",
          "% of Total Sales"
        ]
      ];
      
      const totalTransactions = data.recentTransactions.reduce((sum, item) => sum + item.total, 0);
      
      const transactionsDetails = [
        ...transactionsHeader,
        ...data.recentTransactions.map(item => {
          const percentOfTotal = (item.total / totalTransactions) * 100;
          
          return [
            item.id,
            item.date,
            item.customer,
            item.items,
            item.total,
            formatToRupees(item.total),
            `${percentOfTotal.toFixed(2)}%`
          ];
        })
      ];
      
      // Add summary row
      transactionsDetails.push(
        [],
        [
          "Total", 
          `${data.recentTransactions.length} transactions`, 
          "", 
          data.recentTransactions.reduce((sum, item) => sum + item.items, 0),
          totalTransactions,
          formatToRupees(totalTransactions),
          "100%"
        ]
      );
      
      const sheet = XLSX.utils.aoa_to_sheet(transactionsDetails);
      
      // Set column widths for better readability
      sheet['!cols'] = [
        { wch: 20 }, // Transaction ID
        { wch: 15 }, // Date
        { wch: 25 }, // Customer
        { wch: 12 }, // Items count
        { wch: 15 }, // Amount
        { wch: 20 }, // Formatted amount
        { wch: 15 }, // % of total
      ];
      
      XLSX.utils.book_append_sheet(wb, sheet, "Transactions");
      
      // Generate file with specific name for transactions report
      const fileName = `transactions-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log(`Successfully exported transactions report to ${fileName}`);
      return true;
    } catch (err) {
      console.error("Error generating transactions report:", err);
      return false;
    }
  };

  return { 
    data, 
    isLoading, 
    error, 
    exportToPDF, 
    exportToExcel,
    exportProductData,
    exportTransactionData,
    updateTransaction
  };
};
