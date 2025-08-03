
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Components that need useSidebar will be defined inside the SidebarProvider
const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex w-full relative overflow-hidden">
      <AppSidebar />
      <SidebarToggle />
      <SwipeHandle />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="container py-6 px-4 md:px-6 dashboard-content animate-fade-in relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

const SidebarToggle = () => {
  const { state, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  // On mobile, we'll use the mobile toggle
  if (isMobile) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed left-4 top-4 z-50 glass bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
        onClick={() => setOpenMobile(true)}
      >
        <PanelLeft className="h-5 w-5" />
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
      className="fixed left-4 top-4 z-50 glass bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );
};

// Component for the swipe handle
const SwipeHandle = () => {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div 
      className="fixed left-0 top-0 w-2 h-full bg-white/20 opacity-50 z-40"
      aria-hidden="true"
    />
  );
};

// The main DashboardLayout component that provides the SidebarProvider context
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // This component doesn't use useSidebar hook directly anymore
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
