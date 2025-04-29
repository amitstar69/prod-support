import React, { useState, useEffect } from 'react';
import { HelpRequest, HelpSession } from '../../types/helpRequest';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Calendar, User, Code, MessageSquare } from 'lucide-react';
import CodeEditor from '../code/CodeEditor';
import ChatInterface from '../chat/ChatInterface';

interface HelpSessionInterfaceProps {
  sessionId: string;
  userId: string;
  userRole: 'client' | 'developer';
}

const HelpSessionInterface: React.FC<HelpSessionInterfaceProps> = ({
  sessionId,
  userId,
  userRole
}) => {
  const [session, setSession] = useState<HelpSession | null>(null);
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [sharedCode, setSharedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('code');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const processHelpRequest = (request: any): HelpRequest => {
    // Normalize attachments to always be an array
    let attachmentsArray: any[] = [];
    if (request.attachments) {
      if (Array.isArray(request.attachments)) {
        attachmentsArray = request.attachments;
      } else if (typeof request.attachments === 'string') {
        try {
          const parsed = JSON.parse(request.attachments);
          attachmentsArray = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          attachmentsArray = [];
        }
      }
    }

    return {
      ...request,
      attachments: attachmentsArray
    } as HelpRequest;
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('help_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (sessionError) {
          throw new Error(`Failed to load session: ${sessionError.message}`);
        }
        
        if (!sessionData) {
          throw new Error('Session not found');
        }
        
        setSession(sessionData);
        setSharedCode(sessionData.shared_code || '');
        
        // Fetch the associated help request
        if (sessionData.request_id) {
          const { data: requestData, error: requestError } = await supabase
            .from('help_requests')
            .select('*')
            .eq('id', sessionData.request_id)
            .single();
            
          if (requestError) {
            throw new Error(`Failed to load help request: ${requestError.message}`);
          }
          
          if (requestData) {
            setHelpRequest(processHelpRequest(requestData));
          }
        }
      } catch (err) {
        console.error('Error fetching session data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionData();
    
    // Set up real-time subscription for code updates
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'help_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session updated:', payload);
          const updatedSession = payload.new as HelpSession;
          
          // Only update if the shared_code has changed and it's not from our own update
          if (updatedSession.shared_code !== sharedCode && !isSaving) {
            setSharedCode(updatedSession.shared_code || '');
            setSession(prevSession => ({
              ...prevSession,
              ...updatedSession
            }));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);
  
  const handleCodeChange = (newCode: string) => {
    setSharedCode(newCode);
  };
  
  const saveCode = async () => {
    if (!session) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('help_sessions')
        .update({ shared_code: sharedCode })
        .eq('id', session.id);
        
      if (error) {
        throw new Error(`Failed to save code: ${error.message}`);
      }
      
      toast.success('Code saved successfully');
    } catch (err) {
      console.error('Error saving code:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };
  
  const startSession = async () => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('help_sessions')
        .update({ 
          actual_start: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', session.id);
        
      if (error) {
        throw new Error(`Failed to start session: ${error.message}`);
      }
      
      setSession(prev => ({
        ...prev!,
        actual_start: new Date().toISOString(),
        status: 'in_progress'
      }));
      
      toast.success('Session started');
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to start session');
    }
  };
  
  const endSession = async () => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('help_sessions')
        .update({ 
          actual_end: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', session.id);
        
      if (error) {
        throw new Error(`Failed to end session: ${error.message}`);
      }
      
      setSession(prev => ({
        ...prev!,
        actual_end: new Date().toISOString(),
        status: 'completed'
      }));
      
      toast.success('Session completed');
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to end session');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>Failed to load session</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Not Found</CardTitle>
          <CardDescription>The requested session could not be found</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please check the session ID and try again.</p>
        </CardContent>
      </Card>
    );
  }
  
  const isSessionActive = session.status === 'in_progress';
  const isSessionCompleted = session.status === 'completed';
  const canStartSession = session.status === 'scheduled' && userRole === 'developer';
  const canEndSession = isSessionActive && userRole === 'developer';
  const otherId = userRole === 'client' ? session.developer_id : session.client_id;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Help Session</span>
            <div className="text-sm font-normal bg-muted px-3 py-1 rounded-full">
              {session.status}
            </div>
          </CardTitle>
          <CardDescription>
            {helpRequest?.title || 'Untitled Help Request'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Scheduled:</span>
              <span>
                {session.scheduled_start ? new Date(session.scheduled_start).toLocaleString() : 'Not scheduled'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
              <span>
                {session.scheduled_end && session.scheduled_start ? 
                  `${Math.round((new Date(session.scheduled_end).getTime() - new Date(session.scheduled_start).getTime()) / 60000)} minutes` : 
                  'Not specified'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {userRole === 'client' ? 'Developer:' : 'Client:'}
              </span>
              <span>
                {userRole === 'client' ? 
                  `Developer #${session.developer_id?.substring(0, 6)}` : 
                  `Client #${session.client_id?.substring(0, 6)}`}
              </span>
            </div>
            {session.actual_start && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Started:</span>
                <span>
                  {formatDistanceToNow(new Date(session.actual_start), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
          
          {helpRequest && (
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <h4 className="text-sm font-medium mb-1">Help Request Description</h4>
              <p className="text-sm text-muted-foreground">{helpRequest.description}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {canStartSession && (
            <Button onClick={startSession}>Start Session</Button>
          )}
          {canEndSession && (
            <Button onClick={endSession} variant="outline">End Session</Button>
          )}
          {isSessionCompleted && (
            <div className="text-sm text-muted-foreground">
              Session completed {session.actual_end && formatDistanceToNow(new Date(session.actual_end), { addSuffix: true })}
            </div>
          )}
        </CardFooter>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>Shared Code</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shared Code Editor</CardTitle>
              <CardDescription>
                Code changes are shared in real-time between you and the {userRole === 'client' ? 'developer' : 'client'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] border rounded-md">
                <CodeEditor
                  value={sharedCode}
                  onChange={handleCodeChange}
                  language="javascript"
                  readOnly={isSessionCompleted}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={saveCode} 
                disabled={isSaving || isSessionCompleted}
              >
                {isSaving ? 'Saving...' : 'Save Code'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="chat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Chat</CardTitle>
              <CardDescription>
                Communicate with the {userRole === 'client' ? 'developer' : 'client'} during your session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {otherId && (
                <ChatInterface
                  helpRequestId={session.request_id || ''}
                  otherId={otherId}
                  otherName={userRole === 'client' ? 'Developer' : 'Client'}
                  currentUserId={userId}
                  readOnly={isSessionCompleted}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSessionInterface;
