
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsMobile, useSwipeGesture } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SidebarToggle = () => {
  const { state, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  // On mobile, we'll use the mobile toggle
  if (isMobile) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed left-4 top-4 z-50 bg-white shadow-md border-stockease-100"
        onClick={() => setOpenMobile(true)}
      >
        <PanelLeft className="h-5 w-5 text-stockease-600" />
        <span className="sr-only">Open Sidebar</span>
      </Button>
    );
  }
  
  // On desktop, only show the toggle when sidebar is collapsed
  if (state === "expanded") return null;
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="fixed left-4 top-4 z-50 bg-white shadow-md border-stockease-100"
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-5 w-5 text-stockease-600" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );
};

// New component for the swipe handle
const SwipeHandle = () => {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div 
      className="fixed left-0 top-0 w-2 h-full bg-stockease-100 opacity-50 z-40"
      aria-hidden="true"
    />
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { setOpenMobile } = useSidebar();
  
  // Use the swipe gesture hook
  useSwipeGesture(() => {
    setOpenMobile(true);
  });
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-stockease-50/30 via-white to-indigo-50/30">
        <AppSidebar />
        <SidebarToggle />
        <SwipeHandle />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 px-4 md:px-6 dashboard-content animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
