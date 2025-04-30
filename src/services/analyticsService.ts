
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, where, Timestamp, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

// Types for analytics data
export interface SalesData {
  name: string;
  value: number;
  date?: Date;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface ProductPerformance {
  name: string;
  revenue: number;
  profit: number;
  cost: number;
}

export interface DailySales {
  name: string;
  sales: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  profitMargin: number;
  averageOrderValue: number;
  conversionRate: number;
  lastUpdated: Date;
}

// Hook for real-time sales data
export const useMonthlySalesData = (timeRange: string) => {
  const [data, setData] = useState<SalesData[]>([]);
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

    // Create a query against the sales collection
    const salesRef = collection(db, "sales");
    const q = query(
      salesRef, 
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(now)),
      orderBy("date", "asc")
    );

    // Real-time listener
    try {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        // Group sales by month
        const monthlySales = querySnapshot.docs.reduce((acc: Record<string, number>, doc) => {
          const data = doc.data();
          const date = data.date.toDate();
          const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;
          
          if (!acc[monthYear]) {
            acc[monthYear] = 0;
          }
          
          acc[monthYear] += data.total || 0;
          return acc;
        }, {});
        
        // Convert to array format needed for charts
        const formattedData = Object.keys(monthlySales).map(month => ({
          name: month,
          value: monthlySales[month],
        }));
        
        setData(formattedData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching sales data:", error);
        setError(error.message);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error setting up sales data listener:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [timeRange]);

  return { data, isLoading, error };
};

// Hook for real-time category data
export const useCategoryData = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Query categories collection in Firestore
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("value", "desc"), limit(5));
    
    try {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categories = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            value: data.value,
          };
        });
        
        setData(categories);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching category data:", error);
        setError(error.message);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error setting up category data listener:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error };
};

// Hook for real-time product performance data
export const useProductPerformance = () => {
  const [data, setData] = useState<ProductPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Query products collection
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("revenue", "desc"), limit(5));
    
    try {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const products = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            revenue: data.revenue || 0,
            cost: data.cost || 0,
            profit: (data.revenue || 0) - (data.cost || 0),
          };
        });
        
        setData(products);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching product performance data:", error);
        setError(error.message);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error setting up product performance data listener:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error };
};

// Hook for real-time daily sales data
export const useDailySales = () => {
  const [data, setData] = useState<DailySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Get data for last 7 days
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    const salesRef = collection(db, "sales");
    const q = query(
      salesRef, 
      where("date", ">=", Timestamp.fromDate(weekAgo)),
      orderBy("date", "asc")
    );
    
    try {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        // Group sales by day of week
        const dailySales = querySnapshot.docs.reduce((acc: Record<string, number>, doc) => {
          const data = doc.data();
          const date = data.date.toDate();
          const day = date.toLocaleString('default', { weekday: 'short' });
          
          if (!acc[day]) {
            acc[day] = 0;
          }
          
          acc[day] += data.total || 0;
          return acc;
        }, {});
        
        // Ensure all days of week are represented
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const formattedData = daysOfWeek.map(day => ({
          name: day,
          sales: dailySales[day] || 0,
        }));
        
        setData(formattedData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching daily sales data:", error);
        setError(error.message);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error setting up daily sales data listener:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error };
};

// Hook for analytics summary data
export const useAnalyticsSummary = () => {
  const [data, setData] = useState<AnalyticsSummary>({
    totalRevenue: 0,
    profitMargin: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    lastUpdated: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        // Get summary from a dedicated summary document for better performance
        const summaryRef = collection(db, "analytics");
        const summarySnap = await getDocs(summaryRef);
        
        if (!summarySnap.empty) {
          const summaryData = summarySnap.docs[0].data();
          setData({
            totalRevenue: summaryData.totalRevenue || 0,
            profitMargin: summaryData.profitMargin || 0,
            averageOrderValue: summaryData.averageOrderValue || 0,
            conversionRate: summaryData.conversionRate || 0,
            lastUpdated: summaryData.lastUpdated?.toDate() || new Date(),
          });
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching analytics summary:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSummaryData();
    
    // Set up a listener for real-time updates
    const summaryRef = collection(db, "analytics");
    const unsubscribe = onSnapshot(summaryRef, (snapshot) => {
      if (!snapshot.empty) {
        const summaryData = snapshot.docs[0].data();
        setData({
          totalRevenue: summaryData.totalRevenue || 0,
          profitMargin: summaryData.profitMargin || 0,
          averageOrderValue: summaryData.averageOrderValue || 0,
          conversionRate: summaryData.conversionRate || 0,
          lastUpdated: summaryData.lastUpdated?.toDate() || new Date(),
        });
      }
    }, (err) => {
      console.error("Error in analytics summary listener:", err);
      setError(err.message);
    });
    
    return () => unsubscribe();
  }, []);

  return { data, isLoading, error };
};
