
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useEffect } from 'react';
import * as animeJs from 'animejs';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  useEffect(() => {
    // Animate the main content entrance
    animeJs.default({
      targets: '.dashboard-content',
      opacity: [0, 1],
      translateY: [10, 0],
      easing: 'easeOutCubic',
      duration: 600,
      delay: 100
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-stockease-50/30 via-white to-indigo-50/30">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 px-4 md:px-6 dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
