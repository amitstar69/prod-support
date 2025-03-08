
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/auth';
import { HelpSession, HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import {
  Clock,
  MessageSquare,
  Video,
  Code,
  Share2,
  Play,
  Pause,
  StopCircle,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import CodeEditor from './CodeEditor';
import ChatInterface from './ChatInterface';

const HelpSessionInterface: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userId, userType } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<HelpSession | null>(null);
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  // Timer effect for tracking session duration
  useEffect(() => {
    let intervalId: number;
    
    if (isSessionRunning) {
      intervalId = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSessionRunning]);

  const fetchSessionData = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch the session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('help_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        toast.error('Failed to load session data');
        navigate('/developer-dashboard');
        return;
      }
      
      setSession(sessionData);
      
      // Fetch the associated help request
      const { data: requestData, error: requestError } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', sessionData.request_id)
        .single();
        
      if (requestError) {
        console.error('Error fetching help request:', requestError);
        toast.error('Failed to load request details');
      } else {
        setHelpRequest(requestData);
      }
      
      // Calculate elapsed time if session is already in progress
      if (sessionData.actual_start && !sessionData.actual_end) {
        const startTime = new Date(sessionData.actual_start).getTime();
        const currentTime = new Date().getTime();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(elapsed);
        setIsSessionRunning(true);
      }
      
    } catch (error) {
      console.error('Exception fetching session data:', error);
      toast.error('An unexpected error occurred while loading the session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!session || !userId) return;
    
    try {
      setIsSavingSession(true);
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('help_sessions')
        .update({
          actual_start: now,
          status: 'in-progress'
        })
        .eq('id', session.id);
        
      if (error) {
        console.error('Error starting session:', error);
        toast.error('Failed to start the session');
        return;
      }
      
      // Also update the help request status
      await supabase
        .from('help_requests')
        .update({
          status: 'in-progress'
        })
        .eq('id', session.request_id);
      
      setSession({
        ...session,
        actual_start: now,
        status: 'in-progress'
      });
      
      setIsSessionRunning(true);
      toast.success('Session started successfully!');
      
    } catch (error) {
      console.error('Exception starting session:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSavingSession(false);
    }
  };

  const handlePauseResumeSession = async () => {
    setIsSessionRunning(prev => !prev);
    toast.info(isSessionRunning ? 'Session paused' : 'Session resumed');
  };

  const handleEndSession = async () => {
    if (!session || !userId) return;
    
    try {
      setIsSavingSession(true);
      
      const now = new Date().toISOString();
      
      // Calculate final cost based on elapsed time and rate
      // This is a simple calculation, in reality you might want to use the
      // developer's rate from their profile
      const minutesElapsed = Math.ceil(elapsedTime / 60);
      const hourlyRate = 75; // Default rate in USD
      const finalCost = (hourlyRate / 60) * minutesElapsed;
      
      const { error } = await supabase
        .from('help_sessions')
        .update({
          actual_end: now,
          status: 'completed',
          final_cost: finalCost
        })
        .eq('id', session.id);
        
      if (error) {
        console.error('Error ending session:', error);
        toast.error('Failed to end the session');
        return;
      }
      
      // Also update the help request status
      await supabase
        .from('help_requests')
        .update({
          status: 'completed'
        })
        .eq('id', session.request_id);
      
      setSession({
        ...session,
        actual_end: now,
        status: 'completed',
        final_cost: finalCost
      });
      
      setIsSessionRunning(false);
      toast.success('Session completed successfully!');
      
      // Navigate to a summary page or back to dashboard
      setTimeout(() => {
        navigate('/session-summary/' + session.id);
      }, 2000);
      
    } catch (error) {
      console.error('Exception ending session:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSavingSession(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session || !helpRequest) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
        <p className="text-muted-foreground mb-6">The session you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/developer-dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{helpRequest.title}</h1>
            <p className="text-muted-foreground">{helpRequest.description}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-2xl font-mono bg-secondary p-2 rounded-md">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Session {session.status}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main workspace - takes 3/4 of the space on large screens */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-2" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="border rounded-md mt-2">
              <CodeEditor 
                initialCode={helpRequest.code_snippet || '// Write your code here'}
                language="javascript"
              />
            </TabsContent>
            
            <TabsContent value="chat" className="border rounded-md mt-2 h-[600px]">
              <ChatInterface sessionId={session.id} />
            </TabsContent>
            
            <TabsContent value="video" className="border rounded-md mt-2 h-[600px] flex items-center justify-center">
              <div className="text-center p-8">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Video Call</h3>
                <p className="text-muted-foreground mb-4">Connect via video to discuss the issue in real-time.</p>
                <Button>
                  Start Video Call
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - takes 1/4 of the space on large screens */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Session Controls</CardTitle>
              <CardDescription>
                Manage your current help session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.status === 'scheduled' && (
                  <Button 
                    className="w-full" 
                    onClick={handleStartSession}
                    disabled={isSavingSession}
                  >
                    {isSavingSession ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Start Session
                  </Button>
                )}
                
                {session.status === 'in-progress' && (
                  <>
                    <Button 
                      className="w-full" 
                      variant={isSessionRunning ? "default" : "outline"}
                      onClick={handlePauseResumeSession}
                      disabled={isSavingSession}
                    >
                      {isSessionRunning ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Session
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Session
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={handleEndSession}
                      disabled={isSavingSession}
                    >
                      {isSavingSession ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <StopCircle className="h-4 w-4 mr-2" />
                      )}
                      End Session
                    </Button>
                  </>
                )}
                
                {session.status === 'completed' && (
                  <div className="text-center py-2">
                    <p className="text-green-600 font-medium">Session Completed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Final cost: ${session.final_cost?.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{session.status}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Technical Area:</span>
                  <span className="font-medium">{helpRequest.technical_area.join(', ')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Duration:</span>
                  <span className="font-medium">{helpRequest.estimated_duration} mins</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{helpRequest.budget_range}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Elapsed:</span>
                  <span className="font-medium">{formatTime(elapsedTime)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Cost:</span>
                  <span className="font-medium">
                    ${((75 / 60) * Math.ceil(elapsedTime / 60)).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Screen
          </Button>
          
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Save Session Notes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpSessionInterface;
