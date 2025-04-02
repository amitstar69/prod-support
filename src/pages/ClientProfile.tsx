
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth, invalidateUserDataCache } from '../contexts/auth';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import MessagesSection from '../components/chat/MessagesSection';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { useClientProfile } from '../hooks/useClientProfile';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, userId } = useAuth();
  const [activeTab, setActiveTab] = React.useState<string>('profile');
  const {
    client,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges,
    refreshProfile
  } = useClientProfile();

  // Force refresh profile data when navigating to this page and handle component unmounting
  useEffect(() => {
    console.log('ClientProfile component mounted or location changed');
    
    // Only show long loading message if we're genuinely having trouble
    const longLoadingTimeoutId = setTimeout(() => {
      if (isLoading) {
        toast.info("Profile is taking longer than normal to load. Please be patient...");
      }
    }, 5000);
    
    if (userId) {
      // Clean start - invalidate the cache first
      invalidateUserDataCache(userId);
      
      // Then trigger a refresh with a small delay to ensure the invalidation is processed
      const refreshTimeoutId = setTimeout(() => {
        console.log('Initiating profile refresh');
        refreshProfile();
      }, 300);
      
      // Cleanup timeouts on unmount
      return () => {
        console.log('ClientProfile component unmounting - cleaning up');
        clearTimeout(longLoadingTimeoutId);
        clearTimeout(refreshTimeoutId);
      };
    } else {
      toast.error("User not logged in. Please log in to view your profile.");
      navigate('/login');
      return () => {
        clearTimeout(longLoadingTimeoutId);
      };
    }
  }, [userId, navigate, refreshProfile]);

  const handleForceLogout = async () => {
    try {
      console.log('Forcing logout due to profile loading issues');
      localStorage.removeItem('authState');
      if (userId) {
        invalidateUserDataCache(userId);
      }
      await logout();
      toast.info("You've been logged out. Please log in again.");
      navigate('/login');
    } catch (error) {
      console.error('Error during force logout:', error);
      window.location.href = '/login';
    }
  };

  const handleRetry = () => {
    if (userId) {
      console.log('Retry requested - clearing cache and refreshing');
      invalidateUserDataCache(userId);
      
      // Use a small delay to ensure cache invalidation is processed
      setTimeout(() => {
        toast.info("Retrying profile load...");
        refreshProfile();
      }, 300);
    }
  };

  const handleBack = () => {
    // Invalidate cache before navigating back to ensure dashboard sees fresh data
    if (userId) {
      console.log('Invalidating cache before navigating back to dashboard');
      invalidateUserDataCache(userId);
    }
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Layout>
        <ProfileLoadingState onForceLogout={handleForceLogout} />
      </Layout>
    );
  }

  if (loadingTimeoutReached) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Loading Timeout"
          message="We couldn't load your profile information in a reasonable time. This could be due to connection issues or server problems."
          onRetry={handleRetry}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Profile not found"
          message="We couldn't find your profile information. Please try logging out and logging back in."
          onRetry={handleRetry}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }

  // Calculate profile completion percentage
  const profileCompletionPercentage = client.profileCompletionPercentage || 0;
  
  // Calculate setup progress - this is different from profile completion
  // It includes other onboarding steps beyond just profile completion
  const setupSteps = [
    !!client.profileCompleted,             // Profile completed
    !!client.completedFirstSession,        // First session completed 
    !!client.hasZoom,                      // Zoom setup
    !!client.paymentMethodAdded            // Payment method added
  ];
  
  const completedSetupSteps = setupSteps.filter(step => step).length;
  const setupProgressPercentage = Math.round((completedSetupSteps / setupSteps.length) * 100);

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
          
          <div className="max-w-md mx-auto mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm">{profileCompletionPercentage}%</span>
            </div>
            <Progress value={profileCompletionPercentage} className="h-2" />
          </div>
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
