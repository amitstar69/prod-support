import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth, invalidateUserDataCache } from '../contexts/auth';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import MessagesSection from '../components/chat/MessagesSection';
import { ArrowLeft, User, MessageSquare, History, CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { useClientProfile, useProfileCompletion } from '../hooks/client-profile';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const { completionPercentage } = useProfileCompletion(formData);

  useEffect(() => {
    console.log('ClientProfile component mounted or location changed');
    
    const longLoadingTimeoutId = setTimeout(() => {
      if (isLoading) {
        toast.info("Profile is taking longer than normal to load. Please be patient...");
      }
    }, 5000);
    
    if (userId) {
      invalidateUserDataCache(userId);
      const refreshTimeoutId = setTimeout(() => {
        console.log('Initiating profile refresh');
        refreshProfile();
      }, 300);
      
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
      setTimeout(() => {
        toast.info("Retrying profile load...");
        refreshProfile();
      }, 300);
    }
  };

  const handleBack = () => {
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

  const setupSteps = [
    !!client.profileCompleted,
    !!client.completedFirstSession,
    !!client.hasZoom,
    !!client.paymentMethodAdded
  ];
  
  const completedSetupSteps = setupSteps.filter(step => step).length;
  const setupProgressPercentage = Math.round((completedSetupSteps / setupSteps.length) * 100);

  return (
    <Layout>
      <div className="bg-secondary/30 py-6 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto text-muted-foreground" 
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{formData.firstName} {formData.lastName}</h1>
              <div className="flex items-center text-muted-foreground text-sm">
                <span className="mr-2">@{formData.username || 'username'}</span>
                {formData.location && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{formData.location}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col w-full md:w-auto">
              <div className="flex justify-between items-center mb-1 w-full md:w-64">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 w-full md:w-64" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-6 bg-card/50 p-1 border border-border/30 rounded-md">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="max-w-4xl mx-auto">
              <ProfileCard 
                client={client}
                formData={formData}
                onInputChange={handleInputChange}
                isSaving={isSaving}
                onSave={handleSaveChanges}
              />
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
                <MessagesSection />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions">
            <div className="max-w-4xl mx-auto">
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
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="max-w-4xl mx-auto">
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
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-4xl mx-auto">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientProfile;
