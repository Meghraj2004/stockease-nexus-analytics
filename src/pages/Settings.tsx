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
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
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
  Shield, 
  Palette,
  Bell, 
  Database,
  UserCog
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
  
  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState("30");
  
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
          // Load user preferences
          if (data.preferences) {
            setLowStockAlerts(data.preferences.lowStockAlerts ?? true);
            setEmailNotifications(data.preferences.emailNotifications ?? true);
            setDarkMode(data.preferences.darkMode ?? false);
            setAutoBackup(data.preferences.autoBackup ?? true);
          }
          
          // Load security settings
          if (data.security) {
            setTwoFactorAuth(data.security.twoFactorAuth ?? false);
            setPasswordExpiry(data.security.passwordExpiry ?? false);
            setInactivityTimeout(data.security.inactivityTimeout ?? "30");
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadUserSettings();
    
    // Load database statistics
    fetchDatabaseStats();
  }, [currentUser]);
  
  // Update theme when dark mode changes
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setTheme]);
  
  // Fetch database statistics
  const fetchDatabaseStats = async () => {
    // Simulate fetching database stats
    // In a real app, this would come from Firestore or an API
    setDatabaseStats({
      records: Math.floor(Math.random() * 20000) + 5000,
      storage: `${(Math.random() * 500).toFixed(1)} MB`,
      transactions: Math.floor(Math.random() * 1000) + 100,
      performance: `${(90 + Math.random() * 9).toFixed(1)}%`
    });
  };
  
  // Handle saving general settings
  const handleSaveGeneralSettings = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      await updateDoc(userSettingsRef, {
        businessInfo: {
          companyName,
          address,
          phone,
          email,
          taxId,
          vatRate,
          currency,
          receiptFooter
        }
      });
      
      toast({
        title: "Settings Saved",
        description: "Your business settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      // If doc doesn't exist yet, create it
      try {
        const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
        await setDoc(userSettingsRef, {
          businessInfo: {
            companyName,
            address,
            phone,
            email,
            taxId,
            vatRate,
            currency,
            receiptFooter
          }
        });
        
        toast({
          title: "Settings Saved",
          description: "Your business settings have been created successfully.",
        });
      } catch (createError) {
        toast({
          title: "Error",
          description: "Failed to save business settings.",
          variant: "destructive",
        });
      }
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
      await updateDoc(userSettingsRef, {
        preferences: {
          lowStockAlerts,
          emailNotifications,
          darkMode,
          autoBackup
        }
      });
      
      toast({
        title: "Preferences Saved",
        description: "Your system preferences have been updated successfully.",
      });
    } catch (error) {
      // If doc doesn't exist yet, create it
      try {
        const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
        await setDoc(userSettingsRef, {
          preferences: {
            lowStockAlerts,
            emailNotifications,
            darkMode,
            autoBackup
          }
        });
        
        toast({
          title: "Preferences Saved",
          description: "Your system preferences have been created successfully.",
        });
      } catch (createError) {
        toast({
          title: "Error",
          description: "Failed to save preferences.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving security settings
  const handleSaveSecurity = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      await updateDoc(userSettingsRef, {
        security: {
          twoFactorAuth,
          passwordExpiry,
          inactivityTimeout
        }
      });
      
      // Show message about 2FA
      if (twoFactorAuth) {
        toast({
          title: "Two-Factor Authentication Enabled",
          description: "You'll be prompted to set up 2FA next time you log in.",
        });
      }
      
      toast({
        title: "Security Settings Saved",
        description: "Your security settings have been updated successfully.",
      });
    } catch (error) {
      // If doc doesn't exist yet, create it
      try {
        const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
        await setDoc(userSettingsRef, {
          security: {
            twoFactorAuth,
            passwordExpiry,
            inactivityTimeout
          }
        });
        
        // Show message about 2FA
        if (twoFactorAuth) {
          toast({
            title: "Two-Factor Authentication Enabled",
            description: "You'll be prompted to set up 2FA next time you log in.",
          });
        }
        
        toast({
          title: "Security Settings Saved",
          description: "Your security settings have been created successfully.",
        });
      } catch (createError) {
        toast({
          title: "Error",
          description: "Failed to save security settings.",
          variant: "destructive",
        });
      }
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
      await updateDoc(userSettingsRef, {
        database: {
          autoOptimize,
          backupFrequency,
          dataRetention
        }
      });
      
      toast({
        title: "Database Settings Saved",
        description: "Your database settings have been updated successfully.",
      });
    } catch (error) {
      // If doc doesn't exist yet, create it
      try {
        const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
        await setDoc(userSettingsRef, {
          database: {
            autoOptimize,
            backupFrequency,
            dataRetention
          }
        });
        
        toast({
          title: "Database Settings Saved",
          description: "Your database settings have been created successfully.",
        });
      } catch (createError) {
        toast({
          title: "Error",
          description: "Failed to save database settings.",
          variant: "destructive",
        });
      }
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
    
    setTwoFactorAuth(false);
    setPasswordExpiry(false);
    setInactivityTimeout("30");
    
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
            twoFactorAuth: false,
            passwordExpiry: false,
            inactivityTimeout: "30"
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
            <TabsList className="grid grid-cols-4 md:w-[600px]">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <SettingsIcon size={16} />
                Business Information
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette size={16} />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield size={16} />
                Security
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
                    <span>{(Math.random() * 20).toFixed(1)} MB</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security options for your system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require an additional verification code when logging in
                      </p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordExpiry">Password Expiry</Label>
                      <p className="text-sm text-muted-foreground">
                        Force password reset every 90 days
                      </p>
                    </div>
                    <Switch
                      id="passwordExpiry"
                      checked={passwordExpiry}
                      onCheckedChange={setPasswordExpiry}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="inactivityTimeout">Session Timeout (minutes)</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out users after inactivity
                    </p>
                    <Input
                      id="inactivityTimeout"
                      type="number"
                      value={inactivityTimeout}
                      onChange={(e) => setInactivityTimeout(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="ml-auto flex items-center gap-2"
                    onClick={handleSaveSecurity}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Shield size={16} />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Access Control</CardTitle>
                  <CardDescription>
                    Manage role-based access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 font-medium">
                      <div>Role</div>
                      <div>Inventory</div>
                      <div>Sales</div>
                      <div>Reports</div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-4 items-center">
                      <div>Admin</div>
                      <div><Switch checked={true} disabled /></div>
                      <div><Switch checked={true} disabled /></div>
                      <div><Switch checked={true} disabled /></div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center">
                      <div>Manager</div>
                      <div><Switch defaultChecked /></div>
                      <div><Switch defaultChecked /></div>
                      <div><Switch defaultChecked /></div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center">
                      <div>Cashier</div>
                      <div><Switch /></div>
                      <div><Switch defaultChecked /></div>
                      <div><Switch /></div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center">
                      <div>Inventory</div>
                      <div><Switch defaultChecked /></div>
                      <div><Switch /></div>
                      <div><Switch /></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto flex items-center gap-2">
                    <UserCog size={16} />
                    Update Permissions
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
                    Current database usage and performance
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
                        <div className="text-sm font-medium">Daily Transactions</div>
                        <div className="text-2xl font-bold">{databaseStats.transactions.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Query Performance</div>
                        <div className="text-2xl font-bold">{databaseStats.performance}</div>
                      </div>
                    </div>
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
