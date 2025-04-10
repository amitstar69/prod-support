
import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('Layout component rendering');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pageReady, setPageReady] = useState(false);
  
  useEffect(() => {
    // Track page load status
    console.log('Layout mounting - setting up page');
    
    const timeoutId = setTimeout(() => {
      setPageReady(true);
      console.log('Layout ready - page fully loaded');
    }, 100);
    
    // Setup network status monitoring
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may not work properly.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      console.log('Layout unmounted');
    };
  }, []);
  
  console.log('Layout render state', { pageReady });
  
  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center py-1 px-2 text-sm">
          You are currently offline. Limited functionality available.
        </div>
      )}
      
      <main className="flex-1">{children}</main>
      
      <footer className="py-6 md:py-10 px-6 border-t border-border/40">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <h3 className="text-lg font-semibold">ProdSupport</h3>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                On-demand support from expert developers when you need it most.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Developers
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                FAQ
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-6 text-center md:text-left text-sm text-muted-foreground">
            © {new Date().getFullYear()} ProdSupport. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
