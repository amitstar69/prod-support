
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import MessagesSection from '../components/chat/MessagesSection';
import { useClientProfile } from '../hooks/useClientProfile';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';

const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);
  
  // Set a fallback timeout to show error state if loading takes too long
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  const { 
    client,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges
  } = useClientProfile();
  
  const handleForceLogout = async () => {
    try {
      toast.info("Logging you out...");
      localStorage.removeItem('authState');
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during force logout:', error);
      // Force reload even if logout fails
      window.location.href = '/';
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // If no userId is available, show error
  if (!userId) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Authentication Error"
          message="You are not properly authenticated. Please log in again."
          onRetry={() => window.location.href = '/login'}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }
  
  // If loading and not timed out yet, show loading state
  if (isLoading && !loadingTimeout) {
    return (
      <Layout>
        <ProfileLoadingState onForceLogout={handleForceLogout} />
      </Layout>
    );
  }
  
  // If loading timeout or stated loading timeout reached, show error
  if (loadingTimeout || loadingTimeoutReached) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Loading Timeout"
          message="We couldn't load your profile information in a reasonable time. This could be due to connection issues or server problems."
          onRetry={() => window.location.reload()}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }
  
  // If client data not found, show error
  if (!client) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Profile not found"
          message="We couldn't find your profile information"
          onRetry={() => window.location.reload()}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-6">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto text-muted-foreground" 
                      onClick={handleBack}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <h1 className="heading-2 mb-2 text-center">Client Profile</h1>
          <p className="text-center text-muted-foreground">Manage your profile information</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          <ProfileSidebar 
            activeTab={activeTab}
            userType="client"
            onTabChange={setActiveTab}
          />
          
          <div>
            {activeTab === 'profile' && (
              <ProfileCard 
                client={client}
                formData={formData}
                onInputChange={handleInputChange}
                isSaving={isSaving}
                onSave={handleSaveChanges}
              />
            )}

            {activeTab === 'messages' && (
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
                <MessagesSection />
              </div>
            )}
            
            {activeTab === 'sessions' && (
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
                <h2 className="text-xl font-semibold mb-4">Session History</h2>
                <p className="text-muted-foreground">View your past and upcoming help sessions.</p>
                <div className="mt-8 text-center py-12 border-2 border-dashed border-border/40 rounded-lg">
                  <p className="text-muted-foreground mb-4">No active sessions found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/get-help')}
                  >
                    Request help
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
                <p className="text-muted-foreground">Manage your payment methods and billing information.</p>
                <div className="mt-8 text-center py-12 border-2 border-dashed border-border/40 rounded-lg">
                  <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                  <Button variant="outline">
                    Add payment method
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and settings.</p>
                
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-2">Notification Preferences</h3>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between py-2">
                        <span>Email notifications</span>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span>Push notifications</span>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">Password & Security</h3>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between py-2">
                        <span>Change password</span>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span>Two-factor authentication</span>
                        <Button variant="outline" size="sm">Setup</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientProfile;
