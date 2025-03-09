
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { getUserSessions } from '../integrations/supabase/sessionManager';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, Clock, Calendar, Monitor, MessageSquare, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SessionsPage = () => {
  const { userId, userType } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (userId && userType) {
      fetchSessions();
    }
  }, [userId, userType]);

  const fetchSessions = async () => {
    if (!userId || !userType) return;
    
    setIsLoading(true);
    try {
      const userRole = userType === 'developer' ? 'developer' : 'client';
      const fetchedSessions = await getUserSessions(userId, userRole);
      setSessions(fetchedSessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-300 text-blue-600">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="border-green-300 text-green-600">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-slate-300 text-slate-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-300 text-red-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const upcomingSessions = sessions.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_start) > new Date()
  );
  
  const activeSessions = sessions.filter(s => 
    s.status === 'in-progress'
  );
  
  const pastSessions = sessions.filter(s => 
    s.status === 'completed' || 
    (s.status === 'scheduled' && new Date(s.scheduled_start) < new Date())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h3 className="mt-4 text-lg font-medium">Loading your sessions...</h3>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Help Sessions</h1>
          <p className="text-muted-foreground">
            Manage your scheduled, active, and past help sessions
          </p>
        </div>

        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="flex-1">
              <CalendarClock className="h-4 w-4 mr-2" />
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              <Monitor className="h-4 w-4 mr-2" />
              Active ({activeSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Past ({pastSessions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-0">
            {upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {session.help_requests?.title || 'Untitled Session'}
                        </CardTitle>
                        {getStatusBadge(session.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {session.help_requests?.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {session.scheduled_start 
                              ? format(new Date(session.scheduled_start), 'PPP') 
                              : 'Date not set'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {session.scheduled_start && session.scheduled_end 
                              ? `${format(new Date(session.scheduled_start), 'h:mm a')} - ${format(new Date(session.scheduled_end), 'h:mm a')}` 
                              : 'Time not set'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {userType === 'developer' 
                              ? 'Client: unknown' 
                              : 'Developer: unknown'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/sessions/${session.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border rounded-lg bg-background">
                <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Upcoming Sessions</h3>
                <p className="mt-2 text-muted-foreground">
                  You don't have any scheduled sessions coming up.
                </p>
                {userType === 'client' && (
                  <Button 
                    className="mt-6" 
                    onClick={() => navigate('/get-help')}
                  >
                    Request Help
                  </Button>
                )}
                {userType === 'developer' && (
                  <Button 
                    className="mt-6" 
                    onClick={() => navigate('/developer-dashboard')}
                  >
                    Browse Help Requests
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            {activeSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map((session) => (
                  <Card key={session.id} className="border-green-200 bg-green-50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {session.help_requests?.title || 'Untitled Session'}
                        </CardTitle>
                        {getStatusBadge(session.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {session.help_requests?.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            Started: {session.actual_start 
                              ? format(new Date(session.actual_start), 'PPP') 
                              : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>In Progress</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {userType === 'developer' 
                              ? 'Client: unknown' 
                              : 'Developer: unknown'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => navigate(`/sessions/${session.id}`)}
                      >
                        Join Session
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border rounded-lg bg-background">
                <Monitor className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Active Sessions</h3>
                <p className="mt-2 text-muted-foreground">
                  You don't have any sessions in progress right now.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            {pastSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {session.help_requests?.title || 'Untitled Session'}
                        </CardTitle>
                        {getStatusBadge(session.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {session.help_requests?.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {session.actual_start 
                              ? format(new Date(session.actual_start), 'PPP') 
                              : (session.scheduled_start 
                                ? format(new Date(session.scheduled_start), 'PPP')
                                : 'Date unknown')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {session.status === 'completed' && session.actual_start && session.actual_end
                              ? `Duration: ${Math.ceil((new Date(session.actual_end).getTime() - new Date(session.actual_start).getTime()) / (1000 * 60))} minutes`
                              : 'Duration unknown'}
                          </span>
                        </div>
                        {session.final_cost && (
                          <div className="flex items-center text-sm font-medium">
                            <span>Cost: ${session.final_cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/session-summary/${session.id}`)}
                      >
                        View Summary
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border rounded-lg bg-background">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Past Sessions</h3>
                <p className="mt-2 text-muted-foreground">
                  You haven't completed any sessions yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SessionsPage;
