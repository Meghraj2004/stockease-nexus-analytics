
import { useState } from "react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  
  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState("30");
  
  // Database Settings
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [dataRetention, setDataRetention] = useState("365");
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  
  const { toast } = useToast();
  
  // Handle saving general settings
  const handleSaveGeneralSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings Saved",
        description: "Your business settings have been updated successfully.",
      });
    }, 1000);
  };
  
  // Handle saving preferences
  const handleSavePreferences = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences Saved",
        description: "Your system preferences have been updated successfully.",
      });
    }, 1000);
  };
  
  // Handle saving security settings
  const handleSaveSecurity = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Security Settings Saved",
        description: "Your security settings have been updated successfully.",
      });
    }, 1000);
  };
  
  // Handle saving database settings
  const handleSaveDatabase = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Database Settings Saved",
        description: "Your database settings have been updated successfully.",
      });
    }, 1000);
  };
  
  // Handle backup now
  const handleBackupNow = () => {
    setIsBackupInProgress(true);
    setTimeout(() => {
      setIsBackupInProgress(false);
      toast({
        title: "Backup Complete",
        description: "Your data has been successfully backed up.",
      });
    }, 3000);
  };
  
  // Handle resetting settings
  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values.",
    });
    
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
            
            <TabsContent value="general" className="space-y-4">
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
                      onCheckedChange={setDarkMode}
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
                    <span>Today at 00:00</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-medium">Storage Used:</span>
                    <span>12.4 MB</span>
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
                        <div className="text-2xl font-bold">12,438</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Storage Used</div>
                        <div className="text-2xl font-bold">243.6 MB</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Daily Transactions</div>
                        <div className="text-2xl font-bold">487</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Query Performance</div>
                        <div className="text-2xl font-bold">98.7%</div>
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
