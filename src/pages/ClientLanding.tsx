
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { ExternalLink, MessageSquare, Code, GitBranch, CreditCard, HelpCircle, Heart, Users, Search, HandshakeIcon, Mail, Star, Download, Check } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const ClientLanding: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [featuredDevs, setFeaturedDevs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setupTasks, setSetupTasks] = useState({
    emailConfirmed: false,
    triedSession: false,
    downloadedZoom: false
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/' } });
      return;
    }
    
    fetchProfileData();
    fetchFeaturedDevelopers();
  }, [isAuthenticated, userId]);
  
  const fetchProfileData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfileData(data);
      
      // Set completed tasks based on profile data
      setSetupTasks({
        emailConfirmed: true, // Assuming email is confirmed since they can login
        triedSession: data?.completed_first_session || false,
        downloadedZoom: data?.has_zoom || false
      });
      
    } catch (error) {
      console.error('Exception fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchFeaturedDevelopers = async () => {
    try {
      // In a real application, you would fetch top-rated developers from your database
      // This is just mock data for demonstration
      setFeaturedDevs([
        {
          id: '1',
          name: 'Gbenga Oladipupo',
          rating: 5.0,
          reviews: 478,
          title: 'Senior Mobile Engineer',
          description: 'with many years of experience',
          hourlyRate: 75
        },
        {
          id: '2',
          name: 'Sagar Jain',
          rating: 5.0,
          reviews: 56,
          title: 'Lead Software Engineer | Product Developer',
          description: 'Seasoned Interviewer',
          hourlyRate: 90
        },
        {
          id: '3',
          name: 'Ryan Brooks',
          rating: 5.0,
          reviews: 88,
          title: 'Google Apps Script developer',
          description: 'with over 10 years of experience',
          hourlyRate: 85
        }
      ]);
    } catch (error) {
      console.error('Error fetching featured developers:', error);
    }
  };
  
  const handleTaskToggle = async (task: string) => {
    const newSetupTasks = { ...setupTasks };
    
    if (task === 'triedSession') {
      newSetupTasks.triedSession = !newSetupTasks.triedSession;
      
      if (newSetupTasks.triedSession) {
        // Update the database that user has tried a session
        await supabase
          .from('profiles')
          .update({ completed_first_session: true })
          .eq('id', userId);
      }
    } else if (task === 'downloadedZoom') {
      newSetupTasks.downloadedZoom = !newSetupTasks.downloadedZoom;
      
      if (newSetupTasks.downloadedZoom) {
        // Update the database that user has downloaded Zoom
        await supabase
          .from('profiles')
          .update({ has_zoom: true })
          .eq('id', userId);
      }
    }
    
    setSetupTasks(newSetupTasks);
  };
  
  const handleGoToDashboard = () => {
    navigate('/client-dashboard');
  };
  
  const handleCreateHelpRequest = () => {
    navigate('/get-help');
  };
  
  const handleContactSupport = () => {
    toast.info('Support team will contact you shortly!');
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome{profileData ? `, ${profileData.name}` : ''}</h1>
          <Button onClick={handleGoToDashboard}>
            Go to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Get Started Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Get Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-all">
                  <CardHeader className="text-center pb-2">
                    <MessageSquare className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-base">Get live help</CardTitle>
                    <CardDescription>1:1 mentorship session</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleCreateHelpRequest}>
                      Schedule
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-all">
                  <CardHeader className="text-center pb-2">
                    <Code className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-base">Get freelance help</CardTitle>
                    <CardDescription>Pay with escrow</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleCreateHelpRequest}>
                      Hire
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-all">
                  <CardHeader className="text-center pb-2">
                    <GitBranch className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-base">Get code reviewed</CardTitle>
                    <CardDescription>Pay with escrow</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleCreateHelpRequest}>
                      Submit
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            {/* Pro Membership Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src="/lovable-uploads/6a656c42-d54c-4f36-9881-c158ec6ffc04.png" 
                      alt="Pro membership" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-1">Enjoy Pro membership on the house</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximize the exposure of your request and reach out to any mentor with ProdSupport Pro. 
                      Your access ends on September 11.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Learn more about Pro <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Find Mentors Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Find Mentors</h2>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search for mentors
                </Button>
              </div>
              
              <Tabs defaultValue="first_session">
                <TabsList className="w-fit">
                  <TabsTrigger value="first_session">First Session Promo</TabsTrigger>
                  <TabsTrigger value="favorite">Favorite</TabsTrigger>
                </TabsList>
                
                <TabsContent value="first_session" className="mt-4 space-y-4">
                  {featuredDevs.map(dev => (
                    <Card key={dev.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-600">
                              {dev.name.charAt(0)}
                            </div>
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{dev.name}</h3>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center text-sm mb-1">
                              <span className="font-medium">{dev.rating}</span>
                              <div className="flex mx-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                              <span className="text-muted-foreground">{dev.reviews} reviews</span>
                              <Badge className="ml-2 bg-orange-500 text-white text-xs" variant="secondary">$</Badge>
                            </div>
                            
                            <p className="text-sm">{dev.title} {dev.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="favorite" className="mt-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">You haven't added any favorites yet</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Account Setup Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Finish Setting Up Your Account</CardTitle>
                  <button className="text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="confirm-email" checked={setupTasks.emailConfirmed} disabled className="mt-1" />
                    <div>
                      <label
                        htmlFor="confirm-email"
                        className={`font-medium ${setupTasks.emailConfirmed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        Confirm your email
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="try-session" 
                      checked={setupTasks.triedSession} 
                      onCheckedChange={() => handleTaskToggle('triedSession')}
                      className="mt-1"
                    />
                    <div>
                      <label
                        htmlFor="try-session"
                        className={`font-medium ${setupTasks.triedSession ? 'line-through text-muted-foreground' : ''}`}
                      >
                        Try out our session room
                      </label>
                      <p className="text-sm text-muted-foreground">(5 mins)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="download-zoom" 
                      checked={setupTasks.downloadedZoom} 
                      onCheckedChange={() => handleTaskToggle('downloadedZoom')}
                      className="mt-1"
                    />
                    <div>
                      <label
                        htmlFor="download-zoom"
                        className={`font-medium ${setupTasks.downloadedZoom ? 'line-through text-muted-foreground' : ''}`}
                      >
                        Download Zoom
                      </label>
                      <p className="text-sm text-muted-foreground">(3 mins)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Method Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <div className="py-4">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <Button className="w-full" variant="outline">
                    Add Card & Buy Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Help & Support Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <Button variant="link" className="p-0 h-auto">How do live 1:1 sessions work?</Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <HandshakeIcon className="h-5 w-5 text-primary" />
                  <Button variant="link" className="p-0 h-auto">How do I hire for freelance work?</Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={handleContactSupport}
                  >
                    Contact our support team
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <Button variant="link" className="p-0 h-auto">Share your feedback</Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <Button variant="link" className="p-0 h-auto">How ProdSupport works</Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <Button variant="link" className="p-0 h-auto">FAQs</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientLanding;
