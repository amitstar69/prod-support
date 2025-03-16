
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Zap, DollarSign, Code, MessageSquare, CalendarClock, FileCode, Users, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/auth';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest, HelpRequestMatch } from '../types/helpRequest';
import DeveloperApplicationModal from '../components/apply/DeveloperApplicationModal';

const DeveloperTicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  // Redirect if not authenticated or not a developer
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'developer')) {
      toast.error('You must be logged in as a developer to view this page');
      navigate('/login', { state: { returnTo: `/developer/tickets/${ticketId}` } });
    }
  }, [isAuthenticated, userType, isLoading, navigate, ticketId]);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) {
        setIsLoading(false);
        toast.error('Invalid ticket ID');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch the ticket details
        const { data: ticketData, error: ticketError } = await supabase
          .from('help_requests')
          .select('*')
          .eq('id', ticketId)
          .single();
        
        if (ticketError) {
          console.error('Error fetching ticket:', ticketError);
          toast.error('Failed to load ticket details');
          return;
        }
        
        setTicket(ticketData as HelpRequest);
        
        // Check if developer has already applied
        if (isAuthenticated && userId) {
          const { data: matchData, error: matchError } = await supabase
            .from('help_request_matches')
            .select('status')
            .eq('request_id', ticketId)
            .eq('developer_id', userId)
            .maybeSingle();
          
          if (matchError) {
            console.error('Error checking application status:', matchError);
          } else if (matchData) {
            setHasApplied(true);
            setApplicationStatus(matchData.status);
          }
        }
      } catch (error) {
        console.error('Exception in fetchTicketDetails:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchTicketDetails();
    } else {
      setIsLoading(false);
    }
  }, [ticketId, isAuthenticated, userId]);
  
  const handleBackClick = () => {
    navigate('/developer-dashboard');
  };
  
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to apply for this ticket');
      navigate('/login', { state: { returnTo: `/developer/tickets/${ticketId}` } });
      return;
    }
    
    setShowApplicationModal(true);
  };
  
  const handleApplicationSuccess = async () => {
    setShowApplicationModal(false);
    setHasApplied(true);
    setApplicationStatus('pending');
    toast.success('Your application has been submitted successfully!');
    
    // Refresh the application status
    if (isAuthenticated && userId && ticketId) {
      const { data } = await supabase
        .from('help_request_matches')
        .select('status')
        .eq('request_id', ticketId)
        .eq('developer_id', userId)
        .maybeSingle();
        
      if (data) {
        setApplicationStatus(data.status);
      }
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Loading ticket details...</h1>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!ticket) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Ticket not found</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">The ticket you're looking for does not exist or has been removed.</p>
              <Button 
                onClick={handleBackClick} 
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Create a more friendly ticket ID from UUID
  const shortTicketId = ticket.id ? `HELP-${ticket.id.substring(0, 4)}` : 'Unknown ID';
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                {shortTicketId}
              </Badge>
              {ticket.status && (
                <Badge 
                  variant="outline"
                  className={`
                    ${ticket.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                      ticket.status === 'completed' ? 'bg-slate-50 text-slate-800 border-slate-200' :
                      ticket.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                      ticket.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-yellow-50 text-yellow-800 border-yellow-200'}
                  `}
                >
                  {ticket.status}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold mt-1">{ticket.title}</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Problem details provided by the client</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-foreground/90">
                  {ticket.description}
                </p>
                
                {ticket.code_snippet && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <FileCode className="h-4 w-4" />
                      Code Snippet
                    </h3>
                    <div className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-sm font-mono">
                      <pre>{ticket.code_snippet}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Technical Requirements</CardTitle>
                <CardDescription>Skills and expertise needed for this task</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      Required Technical Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.technical_area && ticket.technical_area.map((area, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      Desired Developer Experience
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="bg-emerald-50 text-emerald-800 border-emerald-200 capitalize"
                    >
                      {ticket.preferred_developer_experience || 'Any level'}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      Communication Preferences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.communication_preference && ticket.communication_preference.map((pref, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary text-secondary-foreground">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Code className="h-4 w-4" />
                      Complexity Level
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${ticket.complexity_level === 'easy' ? 'bg-green-50 text-green-800 border-green-200' : 
                          ticket.complexity_level === 'hard' ? 'bg-red-50 text-red-800 border-red-200' :
                          'bg-orange-50 text-orange-800 border-orange-200'} capitalize
                      `}
                    >
                      {ticket.complexity_level || 'Medium'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Apply for This Ticket</CardTitle>
                <CardDescription>Share your expertise with the client</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to help with this problem? Submit your application to connect with the client and start earning.
                </p>
                
                {hasApplied ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-center">
                    <h3 className="font-medium text-blue-800">Application Submitted</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Status: <span className="font-medium capitalize">{applicationStatus || 'Pending Review'}</span>
                    </p>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleApplyClick}
                    disabled={ticket.status !== 'pending'}
                  >
                    {ticket.status === 'pending' ? 'Apply Now' : 'Unavailable'}
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Time and budget information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    Request Submitted
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Estimated Duration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ticket.estimated_duration} minutes
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Budget Range
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ticket.budget_range}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    Urgency
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${ticket.urgency === 'low' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                        ticket.urgency === 'high' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        ticket.urgency === 'critical' ? 'bg-red-50 text-red-800 border-red-200' :
                        'bg-yellow-50 text-yellow-800 border-yellow-200'} capitalize
                    `}
                  >
                    {ticket.urgency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Developer Application Modal */}
      {ticket && (
        <DeveloperApplicationModal 
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          ticket={ticket}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </Layout>
  );
};

export default DeveloperTicketDetail;
