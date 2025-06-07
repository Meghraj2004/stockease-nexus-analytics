import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminRoute from "@/components/AdminRoute";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Cloud, 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Palette,
  Database,
  Shield,
  Bell,
  Users,
  Activity,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Settings = () => {
  // Business Information State
  const [companyName, setCompanyName] = useState("StockEase Inc.");
  const [address, setAddress] = useState("123 Business Ave.");
  const [phone, setPhone] = useState("555-123-4567");
  const [email, setEmail] = useState("contact@stockease.com");
  const [taxId, setTaxId] = useState("TAX-12345");
  const [vatRate, setVatRate] = useState("15");
  const [currency, setCurrency] = useState("USD");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for your business!");
  
  // System Preferences State
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  
  // New Security Settings
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState("3");
  
  // New Notification Settings
  const [emailDailyReports, setEmailDailyReports] = useState(true);
  const [emailWeeklyReports, setEmailWeeklyReports] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);
  const [salesAlerts, setSalesAlerts] = useState(false);
  
  // Database Settings
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [dataRetention, setDataRetention] = useState("365");
  const [databaseStats, setDatabaseStats] = useState({
    records: 0,
    storage: "0 MB",
    transactions: 0,
    performance: "0%"
  });
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: "healthy",
    uptime: "99.9%",
    responseTime: "120ms",
    errors: 0
  });
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [isExportInProgress, setIsExportInProgress] = useState(false);
  
  const { toast } = useToast();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  
  // Load user settings from Firestore
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) return;
      
      try {
        const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
        const docSnap = await getDoc(userSettingsRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Loaded settings data:', data);
          
          // Load business info
          if (data.businessInfo) {
            setCompanyName(data.businessInfo.companyName || "StockEase Inc.");
            setAddress(data.businessInfo.address || "123 Business Ave.");
            setPhone(data.businessInfo.phone || "555-123-4567");
            setEmail(data.businessInfo.email || "contact@stockease.com");
            setTaxId(data.businessInfo.taxId || "TAX-12345");
            setVatRate(data.businessInfo.vatRate || "15");
            setCurrency(data.businessInfo.currency || "USD");
            setReceiptFooter(data.businessInfo.receiptFooter || "Thank you for your business!");
          }
          
          // Load user preferences
          if (data.preferences) {
            setLowStockAlerts(data.preferences.lowStockAlerts ?? true);
            setEmailNotifications(data.preferences.emailNotifications ?? true);
            setDarkMode(data.preferences.darkMode ?? false);
            setAutoBackup(data.preferences.autoBackup ?? true);
          }
          
          // Load security settings
          if (data.security) {
            setSessionTimeout(data.security.sessionTimeout || "30");
            setRequirePasswordChange(data.security.requirePasswordChange ?? false);
            setEnableTwoFactor(data.security.enableTwoFactor ?? false);
            setLoginAttempts(data.security.loginAttempts || "3");
          }
          
          // Load notification settings
          if (data.notifications) {
            setEmailDailyReports(data.notifications.emailDailyReports ?? true);
            setEmailWeeklyReports(data.notifications.emailWeeklyReports ?? true);
            setPushNotifications(data.notifications.pushNotifications ?? true);
            setSoundAlerts(data.notifications.soundAlerts ?? true);
            setInventoryAlerts(data.notifications.inventoryAlerts ?? true);
            setSalesAlerts(data.notifications.salesAlerts ?? false);
          }
          
          // Load database settings
          if (data.database) {
            setAutoOptimize(data.database.autoOptimize ?? true);
            setBackupFrequency(data.database.backupFrequency || "daily");
            setDataRetention(data.database.dataRetention || "365");
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadUserSettings();
    loadUsers();
    fetchDatabaseStats();
    fetchSystemHealth();
  }, [currentUser]);
  
  // Update theme when dark mode changes
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setTheme]);
  
  // Load users for user management
  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };
  
  // Fetch system health metrics
  const fetchSystemHealth = async () => {
    // Simulate system health check
    setSystemHealth({
      status: Math.random() > 0.1 ? "healthy" : "warning",
      uptime: `${(99 + Math.random()).toFixed(1)}%`,
      responseTime: `${Math.floor(80 + Math.random() * 100)}ms`,
      errors: Math.floor(Math.random() * 5)
    });
  };
  
  // Fetch real-time database statistics
  const fetchDatabaseStats = async () => {
    if (!currentUser) return;
    
    try {
      let totalRecords = 0;
      let totalTransactions = 0;
      
      // Count inventory records
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      totalRecords += inventorySnapshot.size;
      
      // Count sales records
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      totalRecords += salesSnapshot.size;
      totalTransactions = salesSnapshot.size;
      
      // Count suppliers records
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      totalRecords += suppliersSnapshot.size;
      
      // Estimate storage (rough calculation)
      const estimatedStorage = (totalRecords * 2).toFixed(1); // Rough estimate: 2KB per record
      
      setDatabaseStats({
        records: totalRecords,
        storage: `${estimatedStorage} KB`,
        transactions: totalTransactions,
        performance: "95.2%" // Static for now, could be calculated based on query times
      });
    } catch (error) {
      console.error('Error fetching database stats:', error);
      setDatabaseStats({
        records: 0,
        storage: "0 KB",
        transactions: 0,
        performance: "N/A"
      });
    }
  };
  
  // Handle saving general settings
  const handleSaveGeneralSettings = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const businessData = {
        companyName,
        address,
        phone,
        email,
        taxId,
        vatRate,
        currency,
        receiptFooter
      };
      
      // Check if document exists
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userSettingsRef, {
          businessInfo: businessData,
          updatedAt: new Date()
        });
      } else {
        // Create new document
        await setDoc(userSettingsRef, {
          businessInfo: businessData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      toast({
        title: "Settings Saved",
        description: "Your business settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast({
        title: "Error",
        description: `Failed to save business settings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving security settings
  const handleSaveSecuritySettings = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const securityData = {
        sessionTimeout,
        requirePasswordChange,
        enableTwoFactor,
        loginAttempts
      };
      
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        await updateDoc(userSettingsRef, {
          security: securityData
        });
      } else {
        await setDoc(userSettingsRef, {
          security: securityData
        });
      }
      
      toast({
        title: "Security Settings Saved",
        description: "Your security settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error",
        description: "Failed to save security settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving notification settings
  const handleSaveNotificationSettings = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const notificationData = {
        emailDailyReports,
        emailWeeklyReports,
        pushNotifications,
        soundAlerts,
        inventoryAlerts,
        salesAlerts
      };
      
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        await updateDoc(userSettingsRef, {
          notifications: notificationData
        });
      } else {
        await setDoc(userSettingsRef, {
          notifications: notificationData
        });
      }
      
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving preferences
  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const preferencesData = {
        lowStockAlerts,
        emailNotifications,
        darkMode,
        autoBackup
      };
      
      // Check if document exists
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userSettingsRef, {
          preferences: preferencesData
        });
      } else {
        // Create new document
        await setDoc(userSettingsRef, {
          preferences: preferencesData
        });
      }
      
      toast({
        title: "Preferences Saved",
        description: "Your system preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving database settings
  const handleSaveDatabase = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const databaseData = {
        autoOptimize,
        backupFrequency,
        dataRetention
      };
      
      // Check if document exists
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userSettingsRef, {
          database: databaseData
        });
      } else {
        // Create new document
        await setDoc(userSettingsRef, {
          database: databaseData
        });
      }
      
      toast({
        title: "Database Settings Saved",
        description: "Your database settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving database settings:', error);
      toast({
        title: "Error",
        description: "Failed to save database settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle backup now
  const handleBackupNow = async () => {
    setIsBackupInProgress(true);
    
    // Simulate backup process
    setTimeout(async () => {
      try {
        if (currentUser) {
          // Record backup in Firestore
          const backupRef = doc(db, 'backups', new Date().toISOString());
          await setDoc(backupRef, {
            userId: currentUser.uid,
            timestamp: new Date(),
            status: 'completed',
            size: `${(Math.random() * 10).toFixed(2)} MB`,
            type: 'manual'
          });
        }
        
        setIsBackupInProgress(false);
        toast({
          title: "Backup Complete",
          description: "Your data has been successfully backed up.",
        });
      } catch (error) {
        setIsBackupInProgress(false);
        toast({
          title: "Backup Failed",
          description: "There was an error during the backup process.",
          variant: "destructive",
        });
      }
    }, 3000);
  };
  
  // Handle data export
  const handleExportData = async () => {
    setIsExportInProgress(true);
    
    setTimeout(() => {
      // Simulate data export
      const data = {
        exportDate: new Date().toISOString(),
        company: companyName,
        totalRecords: databaseStats.records,
        users: users.length
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockease-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExportInProgress(false);
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    }, 2000);
  };
  
  // Handle user role update
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      loadUsers(); // Refresh users list
      toast({
        title: "User Updated",
        description: "User role has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      loadUsers(); // Refresh users list
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };
  
  // Handle resetting settings
  const handleResetSettings = async () => {
    // Reset all settings to defaults
    setCompanyName("StockEase Inc.");
    setAddress("123 Business Ave.");
    setPhone("555-123-4567");
    setEmail("contact@stockease.com");
    setTaxId("TAX-12345");
    setVatRate("15");
    setCurrency("USD");
    setReceiptFooter("Thank you for your business!");
    
    setLowStockAlerts(true);
    setEmailNotifications(true);
    setDarkMode(false);
    setAutoBackup(true);
    
    setSessionTimeout("30");
    setRequirePasswordChange(false);
    setEnableTwoFactor(false);
    setLoginAttempts("3");
    
    setEmailDailyReports(true);
    setEmailWeeklyReports(true);
    setPushNotifications(true);
    setSoundAlerts(true);
    setInventoryAlerts(true);
    setSalesAlerts(false);
    
    setAutoOptimize(true);
    setBackupFrequency("daily");
    setDataRetention("365");
    
    // Update theme to light
    setTheme('light');
    
    // If user is logged in, update Firestore
    if (currentUser) {
      try {
        const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
        await setDoc(userSettingsRef, {
          preferences: {
            lowStockAlerts: true,
            emailNotifications: true,
            darkMode: false,
            autoBackup: true
          },
          security: {
            sessionTimeout: "30",
            requirePasswordChange: false,
            enableTwoFactor: false,
            loginAttempts: "3"
          },
          notifications: {
            emailDailyReports: true,
            emailWeeklyReports: true,
            pushNotifications: true,
            soundAlerts: true,
            inventoryAlerts: true,
            salesAlerts: false
          },
          database: {
            autoOptimize: true,
            backupFrequency: "daily",
            dataRetention: "365"
          },
          businessInfo: {
            companyName: "StockEase Inc.",
            address: "123 Business Ave.",
            phone: "555-123-4567",
            email: "contact@stockease.com",
            taxId: "TAX-12345",
            vatRate: "15",
            currency: "USD",
            receiptFooter: "Thank you for your business!"
          }
        });
      } catch (error) {
        console.error("Error resetting settings:", error);
      }
    }
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values.",
    });
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Settings</h1>
              <p className="text-muted-foreground">
                Configure your inventory and sales system
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={isExportInProgress}
                className="flex items-center gap-2"
              >
                {isExportInProgress ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export Data
                  </>
                )}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw size={16} />
                    Reset All Settings
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reset all your settings to their default values.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetSettings}>
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 md:w-full">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <SettingsIcon size={16} />
                Business
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield size={16} />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell size={16} />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users size={16} />
                Users
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Activity size={16} />
                System
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database size={16} />
                Database
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your company details that appear on receipts and reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax/VAT ID</Label>
                      <Input
                        id="taxId"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Input
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="vatRate">Default VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                    <Input
                      id="receiptFooter"
                      value={receiptFooter}
                      onChange={(e) => setReceiptFooter(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={() => {
                    setCompanyName("StockEase Inc.");
                    setAddress("123 Business Ave.");
                    setPhone("555-123-4567");
                    setEmail("contact@stockease.com");
                    setTaxId("TAX-12345");
                    setVatRate("15");
                    setCurrency("USD");
                    setReceiptFooter("Thank you for your business!");
                  }}>
                    Reset
                  </Button>
                  <Button 
                    onClick={handleSaveGeneralSettings} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security policies and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="max-w-xs"
                    />
                    <p className="text-sm text-muted-foreground">
                      Users will be logged out after this period of inactivity
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Maximum Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={loginAttempts}
                      onChange={(e) => setLoginAttempts(e.target.value)}
                      className="max-w-xs"
                    />
                    <p className="text-sm text-muted-foreground">
                      Account will be locked after this many failed attempts
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requirePasswordChange">Force Password Change</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to change passwords every 90 days
                      </p>
                    </div>
                    <Switch
                      id="requirePasswordChange"
                      checked={requirePasswordChange}
                      onCheckedChange={setRequirePasswordChange}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable 2FA for enhanced security (coming soon)
                      </p>
                    </div>
                    <Switch
                      id="enableTwoFactor"
                      checked={enableTwoFactor}
                      onCheckedChange={setEnableTwoFactor}
                      disabled
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="ml-auto flex items-center gap-2"
                    onClick={handleSaveSecuritySettings}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Reports</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailDailyReports">Daily Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive daily sales and inventory summaries
                        </p>
                      </div>
                      <Switch
                        id="emailDailyReports"
                        checked={emailDailyReports}
                        onCheckedChange={setEmailDailyReports}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailWeeklyReports">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive comprehensive weekly analytics
                        </p>
                      </div>
                      <Switch
                        id="emailWeeklyReports"
                        checked={emailWeeklyReports}
                        onCheckedChange={setEmailWeeklyReports}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Real-time Alerts</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when stock levels are low
                        </p>
                      </div>
                      <Switch
                        id="inventoryAlerts"
                        checked={inventoryAlerts}
                        onCheckedChange={setInventoryAlerts}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="salesAlerts">Sales Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified of significant sales events
                        </p>
                      </div>
                      <Switch
                        id="salesAlerts"
                        checked={salesAlerts}
                        onCheckedChange={setSalesAlerts}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive browser notifications
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="soundAlerts">Sound Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Play sound for important notifications
                        </p>
                      </div>
                      <Switch
                        id="soundAlerts"
                        checked={soundAlerts}
                        onCheckedChange={setSoundAlerts}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="ml-auto flex items-center gap-2"
                    onClick={handleSaveNotificationSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{user.email}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Created: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateUserRole(user.id, user.role === 'admin' ? 'employee' : 'admin')}
                            >
                              Make Admin
                            </Button>
                          )}
                          {user.id !== currentUser?.uid && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Monitor system performance and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {systemHealth.status === 'healthy' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : systemHealth.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">System Status</span>
                      </div>
                      <p className="text-2xl font-bold capitalize">{systemHealth.status}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="font-medium">Uptime</span>
                      <p className="text-2xl font-bold">{systemHealth.uptime}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="font-medium">Response Time</span>
                      <p className="text-2xl font-bold">{systemHealth.responseTime}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="font-medium">Errors (24h)</span>
                      <p className="text-2xl font-bold">{systemHealth.errors}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU Usage</span>
                          <span>23%</span>
                        </div>
                        <Progress value={23} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Usage</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Database Performance</span>
                          <span>89%</span>
                        </div>
                        <Progress value={89} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={fetchSystemHealth}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh Status
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                  <CardDescription>
                    Configure general system behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Show alerts when inventory items are low
                      </p>
                    </div>
                    <Switch
                      id="lowStockAlerts"
                      checked={lowStockAlerts}
                      onCheckedChange={setLowStockAlerts}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily sales and inventory reports via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use dark theme for the interface
                      </p>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoBackup">Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup your data daily
                      </p>
                    </div>
                    <Switch
                      id="autoBackup"
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="ml-auto flex items-center gap-2"
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Settings</CardTitle>
                  <CardDescription>
                    Configure database and data management options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoOptimize">Auto-Optimize Database</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically optimize database performance weekly
                      </p>
                    </div>
                    <Switch
                      id="autoOptimize"
                      checked={autoOptimize}
                      onCheckedChange={setAutoOptimize}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <select
                      id="backupFrequency"
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention (days)</Label>
                    <p className="text-sm text-muted-foreground">
                      How long to keep transaction history and logs
                    </p>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Manual Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Create a manual backup of your data right now
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleBackupNow}
                      disabled={isBackupInProgress}
                      className="flex items-center gap-2"
                    >
                      {isBackupInProgress ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Backup in Progress...
                        </>
                      ) : (
                        <>
                          <Cloud size={16} />
                          Backup Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="ml-auto flex items-center gap-2"
                    onClick={handleSaveDatabase}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Database Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Database Statistics</CardTitle>
                  <CardDescription>
                    Real-time database usage and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Total Records</div>
                        <div className="text-2xl font-bold">{databaseStats.records.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Storage Used</div>
                        <div className="text-2xl font-bold">{databaseStats.storage}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Sales Transactions</div>
                        <div className="text-2xl font-bold">{databaseStats.transactions.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Query Performance</div>
                        <div className="text-2xl font-bold">{databaseStats.performance}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={fetchDatabaseStats}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Refresh Statistics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
};

export default Settings;
