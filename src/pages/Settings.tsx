
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
import { useToast } from "@/components/ui/use-toast";
import AdminRoute from "@/components/AdminRoute";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
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
  Database
} from "lucide-react";

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
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  
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
    
    // Load real-time database statistics
    fetchDatabaseStats();
  }, [currentUser]);
  
  // Update theme when dark mode changes
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setTheme]);
  
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
    if (!currentUser) return;
    
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
      
      console.log('Saving business info:', businessData);
      
      // Check if document exists
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userSettingsRef, {
          businessInfo: businessData
        });
      } else {
        // Create new document
        await setDoc(userSettingsRef, {
          businessInfo: businessData
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
        description: "Failed to save business settings. Please try again.",
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
            size: `${(Math.random() * 10).toFixed(2)} MB`
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
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid grid-cols-3 md:w-[450px]">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <SettingsIcon size={16} />
                Business Information
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette size={16} />
                Preferences
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
            
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                  <CardDescription>
                    Configure how the system works and notifies you
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
              
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    Version and database details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="font-medium">System Version:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">Database:</span>
                    <span>Firebase Firestore</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">Last Backup:</span>
                    <span>{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">Storage Used:</span>
                    <span>{databaseStats.storage}</span>
                  </div>
                </CardContent>
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
