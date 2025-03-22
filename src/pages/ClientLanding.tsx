
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, invalidateUserDataCache } from '../contexts/auth';
import { supabase } from '../integrations/supabase/client';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { CalendarClock, Check, ChevronRight, CreditCard, 
  Headphones, HelpCircle, Lightbulb, MessageSquare, PlusCircle, 
  Settings, User, Video, Zap, RefreshCw } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

interface ProfileData {
  id: string;
  name?: string;
  email?: string;
  user_type?: string;
  has_zoom?: boolean;
  completed_first_session?: boolean;
  payment_method_added?: boolean;
  onboarding_completed?: boolean;
  profile_completed?: boolean;
  profile_completion_percentage?: number;
}

const ClientLanding: React.FC = () => {
  const { isAuthenticated, userType, userId } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupProgress, setSetupProgress] = useState(0);
  const [profileCompletionProgress, setProfileCompletionProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    // Redirect if user is not authenticated or not a client
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (userType !== 'client') {
      navigate('/');
      return;
    }
    
    // Force refresh of profile data when dashboard is loaded
    if (userId) {
      console.log('Invalidating cache before dashboard fetch');
      invalidateUserDataCache(userId);
    }
    
    fetchProfileData();
  }, [isAuthenticated, userType, userId, navigate]);
  
  const fetchProfileData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      console.log('Fetching client dashboard profile data for user:', userId);
      
      // First get base profile data (this includes profile_completed flag)
      const { data: profileBaseData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        toast.error('Failed to load your profile data');
        return;
      }
      
      console.log('Client base profile data:', profileBaseData);
      
      // Also fetch client specific profile data to get profile_completion_percentage
      const { data: clientProfileData, error: clientProfileError } = await supabase
        .from('client_profiles')
        .select('*')  // Changed from only 'profile_completion_percentage' to '*' to get all client data
        .eq('id', userId)
        .single();
        
      if (clientProfileError) {
        console.error('Error fetching client profile data:', clientProfileError);
        // Don't return here as we might still have base profile data
      }
      
      console.log('Client specific profile data:', clientProfileData);
      
      // Combine data from both queries
      const combinedData = {
        ...profileBaseData,
        ...(clientProfileData || {})  // Include all client profile data if available
      };
      
      console.log('Combined client dashboard profile data (raw):', combinedData);
      
      // Debug logs - explicitly check profile_completed value and percentage
      console.log('Profile completed flag value:', combinedData.profile_completed);
      console.log('Profile completion percentage:', combinedData.profile_completion_percentage);
      
      setProfileData(combinedData as ProfileData);
      
      // Set profile completion progress directly from the database value
      if (typeof combinedData.profile_completion_percentage === 'number') {
        setProfileCompletionProgress(combinedData.profile_completion_percentage);
      } else {
        // Fallback to binary completion if percentage not available
        setProfileCompletionProgress(combinedData.profile_completed ? 100 : 0);
      }
      
      // Calculate overall setup progress
      calculateSetupProgress(combinedData as ProfileData);
    } catch (error) {
      console.error('Exception fetching profile data:', error);
      toast.error('An unexpected error occurred while loading your profile');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const calculateSetupProgress = (data: ProfileData) => {
    console.log('Calculating setup progress from profile data:', data);
    
    // Create an array of setup steps and whether they're completed
    const setupSteps = [
      !!data.profile_completed, // Profile completion is a boolean
      !!data.has_zoom,          // Zoom setup
      !!data.completed_first_session, // First session
      !!data.payment_method_added     // Payment method
    ];
    
    console.log('Setup steps completed:', setupSteps, 'profile_completed value:', data.profile_completed);
    
    // Count the number of completed steps
    const completedSteps = setupSteps.filter(step => step).length;
    const totalSteps = setupSteps.length;
    
    // Calculate the percentage
    const progress = Math.round((completedSteps / totalSteps) * 100);
    console.log(`Setup progress: ${completedSteps}/${totalSteps} = ${progress}%`);
    
    setSetupProgress(progress);
  };
  
  const handleRefreshData = () => {
    setIsRefreshing(true);
    if (userId) {
      console.log('Manually refreshing profile data');
      invalidateUserDataCache(userId);
      fetchProfileData();
    }
  };
  
  const handleCompleteProfile = () => {
    navigate('/client-profile');
  };
  
  const handleSetupZoom = async () => {
    try {
      toast.loading('Updating profile...');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          has_zoom: true
        })
        .eq('id', userId);
      
      if (error) {
        toast.dismiss();
        toast.error('Failed to update your profile');
        console.error('Error updating profile:', error);
        return;
      }
      
      toast.dismiss();
      toast.success('Profile updated successfully');
      
      // Update local state
      setProfileData(prev => prev ? {...prev, has_zoom: true} : null);
      
      // Force refresh data
      invalidateUserDataCache(userId);
      fetchProfileData();
    } catch (error) {
      toast.dismiss();
      console.error('Exception updating profile:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleCompleteSession = async () => {
    try {
      toast.loading('Updating profile...');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          completed_first_session: true
        })
        .eq('id', userId);
      
      if (error) {
        toast.dismiss();
        toast.error('Failed to update your profile');
        console.error('Error updating profile:', error);
        return;
      }
      
      toast.dismiss();
      toast.success('Profile updated successfully');
      
      // Force refresh data
      invalidateUserDataCache(userId);
      fetchProfileData();
    } catch (error) {
      toast.dismiss();
      console.error('Exception updating profile:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleCreateRequest = () => {
    navigate('/get-help');
  };
  
  const handleViewRequests = () => {
    navigate('/ticket-dashboard');
  };
  
  return (
    <Layout>
      <div className="bg-secondary/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome, {profileData?.name || 'Client'}</h1>
              <p className="text-muted-foreground text-sm">
                Your developer help platform dashboard
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData} 
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Get Started Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Get Started
                </CardTitle>
                <CardDescription>Complete your setup to get the most out of the platform</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Setup progress</span>
                    <span className="font-medium">{setupProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={setupProgress} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      profileData?.profile_completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {profileData?.profile_completed ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1">Complete your profile</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Fill out your profile information to help developers understand your needs better
                      </p>
                      
                      {/* Display profile completion percentage */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Profile completion</span>
                          <span>{profileCompletionProgress}%</span>
                        </div>
                        <Progress value={profileCompletionProgress} className="h-1.5" />
                      </div>
                      
                      <Button size="sm" onClick={handleCompleteProfile}>
                        {profileData?.profile_completed ? 'Edit Profile' : 'Complete Profile'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      profileData?.has_zoom ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {profileData?.has_zoom ? <Check className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1">Set up video meetings</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Confirm you have Zoom installed for effective communication with developers
                      </p>
                      {!profileData?.has_zoom && (
                        <Button size="sm" onClick={handleSetupZoom}>
                          Confirm Zoom Setup
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      profileData?.completed_first_session ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {profileData?.completed_first_session ? <Check className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1">Complete first developer session</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Have your first session with a developer to get help with your project
                      </p>
                      {!profileData?.completed_first_session && (
                        <Button size="sm" onClick={handleCompleteSession}>
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Membership Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Standard Membership</h3>
                    <p className="text-sm text-blue-600 mt-1">Access to on-demand developer help</p>
                  </div>
                  <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Find Developers Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Find Developers
                </CardTitle>
                <CardDescription>Get help with your technical projects</CardDescription>
              </CardHeader>
              
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Create New Request</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    Describe your issue and get matched with qualified developers
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleCreateRequest}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">View Your Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    Manage your existing requests and developer sessions
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" onClick={handleViewRequests}>
                      View Tickets
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Account Setup Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Profile
                  </span>
                  <Badge variant={profileData?.profile_completed ? "default" : "outline"}>
                    {profileData?.profile_completed ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center">
                    <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                    Zoom Setup
                  </span>
                  <Badge variant={profileData?.has_zoom ? "default" : "outline"}>
                    {profileData?.has_zoom ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    Payment Method
                  </span>
                  <Badge variant={profileData?.payment_method_added ? "default" : "outline"}>
                    {profileData?.payment_method_added ? "Added" : "Not Added"}
                  </Badge>
                </div>
                
                <Button size="sm" variant="outline" className="w-full" onClick={handleCompleteProfile}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Account
                </Button>
              </CardContent>
            </Card>
            
            {/* Quick Help Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Quick Tip</AlertTitle>
                  <AlertDescription>
                    Be specific in your help requests to get matched with the right developers faster.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm py-1 hover:bg-muted rounded px-2 cursor-pointer">
                    <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Scheduling Your First Session</span>
                  </div>
                  
                  <div className="flex items-center text-sm py-1 hover:bg-muted rounded px-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Communicating With Developers</span>
                  </div>
                  
                  <div className="flex items-center text-sm py-1 hover:bg-muted rounded px-2 cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Understanding Pricing</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View Help Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientLanding;
