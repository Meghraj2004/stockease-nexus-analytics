import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, where, Timestamp, getDocs } from "firebase/firestore";
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

    // Check if collections exist and have data
    const fetchInitialData = async () => {
      try {
        // Check sales collection
        const salesRef = collection(db, "sales");
        const salesSnapshot = await getDocs(query(salesRef, limit(1)));
        const hasSales = !salesSnapshot.empty;
        
        // Check products collection
        const productsRef = collection(db, "products");
        const productsSnapshot = await getDocs(query(productsRef, limit(1)));
        const hasProducts = !productsSnapshot.empty;
        
        // If no data, generate sample data
        if (!hasSales && !hasProducts) {
          const sampleData = generateSampleReportData();
          setData(sampleData);
          setIsLoading(false);
          return;
        }
        
        // Otherwise set up real-time listeners
        setupRealTimeListeners(startDate, now);
      } catch (err: any) {
        console.error("Error checking collections:", err);
        setError(err.message);
        setIsLoading(false);
        
        // Fallback to sample data
        const sampleData = generateSampleReportData();
        setData(sampleData);
      }
    };
    
    // Generate sample data for demo purposes
    const generateSampleReportData = (): SalesReport => {
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
      
      // Calculate summary
      const totalSales = monthlySalesData.reduce((sum, item) => sum + item.sales, 0);
      
      return {
        monthlySalesData,
        topProducts: sampleProducts,
        recentTransactions: sampleTransactions,
        summary: {
          totalSales,
          transactions: 145,
          averageSale: Math.round(totalSales / 145),
          profitMargin: 38.5
        }
      };
    };
    
    // Set up real-time listeners for all data
    const setupRealTimeListeners = (startDate: Date, now: Date) => {
      // Query for sales data
      const salesRef = collection(db, "sales");
      const salesQuery = query(
        salesRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(now)),
        orderBy("date", "desc")
      );

      // Query for products data
      const productsRef = collection(db, "products");
      const productsQuery = query(
        productsRef,
        orderBy("sales", "desc"),
        limit(5)
      );

      // Query for transactions
      const transactionsQuery = query(
        salesRef,
        orderBy("date", "desc"),
        limit(5)
      );

      try {
        // Set up real-time listeners
        const unsubSales = onSnapshot(salesQuery, (snapshot) => {
          const monthlySales: Record<string, number> = {};
          let totalSales = 0;
          let transactionCount = 0;
          
          snapshot.docs.forEach(doc => {
            const sale = doc.data();
            const date = sale.date?.toDate();
            
            // Skip if date is invalid
            if (!date) return;
            
            const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;
            
            if (!monthlySales[monthYear]) {
              monthlySales[monthYear] = 0;
            }
            
            monthlySales[monthYear] += sale.total || 0;
            totalSales += sale.total || 0;
            transactionCount++;
          });
          
          // Convert to array format needed for charts
          const unsortedData = Object.keys(monthlySales).map(month => ({
            name: month,
            sales: monthlySales[month]
          }));
          
          // Sort by month order
          const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthlySalesData = unsortedData.sort((a, b) => 
            monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name)
          );
          
          // Update state with monthly sales and summary data
          setData(prev => ({
            ...prev,
            monthlySalesData,
            summary: {
              ...prev.summary,
              totalSales,
              transactions: transactionCount,
              averageSale: transactionCount > 0 ? totalSales / transactionCount : 0,
              // Assuming profit margin is 40% of sales
              profitMargin: 40.0
            }
          }));
        }, (error) => {
          console.error("Error in sales listener:", error);
        });
        
        const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
          if (snapshot.empty) {
            // If no products exist, generate sample data
            const sampleProducts = [
              { name: "Laptop", value: 45000 },
              { name: "Smartphone", value: 35000 },
              { name: "Tablet", value: 25000 },
              { name: "Headphones", value: 15000 },
              { name: "Smartwatch", value: 10000 }
            ];
            
            setData(prev => ({
              ...prev,
              topProducts: sampleProducts
            }));
            return;
          }
          
          const topProducts = snapshot.docs.map(doc => {
            const product = doc.data();
            return {
              name: product.name || "Unknown Product",
              value: product.sales || 0,
            };
          });
          
          // Update state with top products
          setData(prev => ({
            ...prev,
            topProducts
          }));
        }, (error) => {
          console.error("Error in products listener:", error);
        });
        
        const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          if (snapshot.empty) {
            // If no transactions exist, generate sample data
            const sampleTransactions = Array.from({ length: 5 }, (_, i) => ({
              id: `INV${10001 + i}`,
              date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
              customer: `Customer ${i + 1}`,
              items: Math.floor(Math.random() * 5) + 1,
              total: Math.floor(Math.random() * 5000) + 1000
            }));
            
            setData(prev => ({
              ...prev,
              recentTransactions: sampleTransactions
            }));
            setIsLoading(false);
            return;
          }
          
          const recentTransactions = snapshot.docs.map(doc => {
            const transaction = doc.data();
            return {
              id: doc.id,
              date: transaction.date ? transaction.date.toDate().toISOString().split('T')[0] : '',
              customer: transaction.customer || 'Guest',
              items: transaction.items || 0,
              total: transaction.total || 0,
            };
          });
          
          // Update state with recent transactions
          setData(prev => ({
            ...prev,
            recentTransactions
          }));
          
          setIsLoading(false);
        }, (error) => {
          console.error("Error in transactions listener:", error);
          setIsLoading(false);
        });
        
        // Clean up listeners on unmount
        return () => {
          unsubSales();
          unsubProducts();
          unsubTransactions();
        };
      } catch (err: any) {
        console.error("Error setting up sales report listeners:", err);
        setError(err.message);
        setIsLoading(false);
        
        // Fallback to sample data
        const sampleData = generateSampleReportData();
        setData(sampleData);
      }
    };

    fetchInitialData();
  }, [timeRange]);

  // Export functions for reports
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

  const exportToExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Monthly sales worksheet
      const monthlySalesData = data.monthlySalesData.map(item => ({
        Month: item.name,
        Sales: item.sales
      }));
      
      const mSheet = XLSX.utils.json_to_sheet(monthlySalesData);
      XLSX.utils.book_append_sheet(wb, mSheet, "Monthly Sales");
      
      // Top products worksheet
      const topProductsData = data.topProducts.map(item => ({
        Product: item.name,
        Sales: item.value
      }));
      
      const pSheet = XLSX.utils.json_to_sheet(topProductsData);
      XLSX.utils.book_append_sheet(wb, pSheet, "Top Products");
      
      // Transactions worksheet
      const transactionsData = data.recentTransactions.map(item => ({
        "Transaction ID": item.id,
        Date: item.date,
        Customer: item.customer,
        Items: item.items,
        Total: item.total
      }));
      
      const tSheet = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, tSheet, "Transactions");
      
      // Summary worksheet
      const summaryData = [
        { Metric: "Total Sales", Value: data.summary.totalSales },
        { Metric: "Transactions", Value: data.summary.transactions },
        { Metric: "Average Sale", Value: data.summary.averageSale },
        { Metric: "Profit Margin", Value: `${data.summary.profitMargin.toFixed(1)}%` }
      ];
      
      const sSheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, sSheet, "Summary");
      
      // Generate the Excel file
      XLSX.writeFile(wb, `sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      return true;
    } catch (err) {
      console.error("Error generating Excel:", err);
      return false;
    }
  };

  return { data, isLoading, error, exportToPDF, exportToExcel };
};
