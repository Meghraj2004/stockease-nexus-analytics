
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// New Inventory Management Pages
import PurchaseOrders from "./pages/PurchaseOrders";
import StockAlerts from "./pages/StockAlerts";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import StockMovement from "./pages/StockMovement";

// Protected Routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/inventory" 
                  element={
                    <ProtectedRoute>
                      <Inventory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sales" 
                  element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />
                
                {/* New Inventory Management Routes */}
                <Route 
                  path="/purchase-orders" 
                  element={
                    <ProtectedRoute>
                      <PurchaseOrders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/stock-alerts" 
                  element={
                    <ProtectedRoute>
                      <StockAlerts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/suppliers" 
                  element={
                    <ProtectedRoute>
                      <Suppliers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/categories" 
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/stock-movement" 
                  element={
                    <ProtectedRoute>
                      <StockMovement />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/users" 
                  element={
                    <AdminRoute>
                      <Users />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <AdminRoute>
                      <Analytics />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <AdminRoute>
                      <Settings />
                    </AdminRoute>
                  } 
                />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
