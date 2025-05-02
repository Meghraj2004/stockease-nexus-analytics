
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  User, 
  ChartBar, 
  FileText, 
  Settings, 
  Home, 
  LogOut
} from 'lucide-react';

export default function AppSidebar() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "Successfully logged out of your account",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userData?.role === 'admin';

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
        >
          <Package className="h-6 w-6 text-stockease-600" />
          <span className="ml-2 text-xl font-bold text-stockease-600">StockEase</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard" className="flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/inventory" className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    <span>Inventory</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/sales" className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    <span>Sales</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/reports" className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/users" className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      <span>Users</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/analytics" className="flex items-center">
                      <ChartBar className="h-5 w-5 mr-2" />
                      <span>Analytics</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/settings" className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <div className="flex items-center mb-2 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-stockease-100 flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-stockease-600" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{userData?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{userData?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
