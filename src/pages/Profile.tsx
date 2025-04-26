import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth, invalidateUserDataCache } from '../contexts/auth';
import DeveloperProfileCard from '../components/profile/DeveloperProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import MessagesSection from '../components/chat/MessagesSection';
import { ArrowLeft, User, MessageSquare, History, CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeveloperProfile } from '../hooks/useDeveloperProfile';
import { supabase } from '../integrations/supabase/client';
import { getUserHomeRoute } from '../contexts/auth/authUtils';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userId, isAuthenticated, userType } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // If this isn't a developer profile, redirect to the correct profile page
  useEffect(() => {
    if (userType === 'client') {
      console.log('Client user detected on developer profile page, redirecting');
      navigate('/client-profile');
      return;
    }
  }, [userType, navigate]);
  
  const { 
    developer,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges,
    refreshProfile
  } = useDeveloperProfile();
  
  // Check auth status on page load and verify profile exists
  useEffect(() => {
    const checkAuthStatus = async () => {
      setCheckingAuth(true);
      
      try {
        // Verify we have a session with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No active session found, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log('Active session found', session.user.id);
        
        // Verify user type is developer, otherwise redirect
        if (userType === 'client') {
          console.log('Client user detected on developer profile page, redirecting');
          navigate('/client-profile');
          return;
        } else if (!userType) {
          console.log('No user type detected, redirecting to login to refresh session');
          navigate('/login');
          return;
        }
        
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate, userType]);
  
  // Force refresh profile data when navigating back to this page
  useEffect(() => {
    if (!checkingAuth && refreshProfile && userType === 'developer') {
      console.log("Profile page mounted or route changed, refreshing data");
      refreshProfile();
    }
    
    // Cleanup on unmount
    return () => {
      console.log("Profile page unmounting");
      if (userId) {
        invalidateUserDataCache(userId);
      }
    };
  }, [location.key, refreshProfile, checkingAuth, userId, userType]);
  
  const handleForceLogout = async () => {
    try {
      localStorage.removeItem('authState');
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during force logout:', error);
      window.location.href = '/';
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleViewAllSessions = () => {
    navigate('/developer/sessions');
  };
  
  // Show loading state while checking authentication or loading profile
  if (checkingAuth || isLoading) {
    return (
      <Layout>
        <ProfileLoadingState onForceLogout={handleForceLogout} />
      </Layout>
    );
  }
  
  // Handle authentication issues
  if (!isAuthenticated || !userId) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Authentication Required"
          message="Please log in to view your profile"
          onForceLogout={() => navigate('/login')}
        />
      </Layout>
    );
  }
  
  // Handle wrong user type
  if (userType !== 'developer') {
    return (
      <Layout>
        <ProfileErrorState 
          title="Incorrect Profile Type"
          message="This profile page is for developers only"
          onForceLogout={() => navigate(getUserHomeRoute(userType))}
        />
      </Layout>
    );
  }
  
  if (loadingTimeoutReached) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Loading Timeout"
          message="We couldn't load your profile information in a reasonable time. This could be due to connection issues or server problems."
          onRetry={() => refreshProfile()}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }
  
  if (!developer) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Profile not found"
          message="We couldn't find your profile information"
          onRetry={() => refreshProfile()}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }
  
  const completionPercentage = developer.profileCompletionPercentage || 0;
  
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
                <span className="text-sm font-medium">{developer.profileCompletionPercentage || 0}%</span>
              </div>
              <Progress value={developer.profileCompletionPercentage || 0} className="h-2 w-full md:w-64" />
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
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="max-w-4xl mx-auto">
              <DeveloperProfileCard 
                developer={developer}
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
                    onClick={() => navigate('/developer/dashboard')}
                  >
                    View available help requests
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
                <h2 className="text-xl font-semibold mb-4">Earnings</h2>
                <p className="text-muted-foreground">Manage your earnings and payment methods.</p>
                <div className="mt-8 text-center py-12 border-2 border-dashed border-border/40 rounded-lg">
                  <p className="text-muted-foreground mb-4">No earnings data available yet</p>
                  <Button variant="outline">
                    Set up payment account
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

export default Profile;
