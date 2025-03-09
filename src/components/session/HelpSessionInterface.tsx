import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, X, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import {
  startHelpSession,
  endHelpSession,
  getHelpSessionDetails,
  sendMessage,
  getSessionMessages,
  getHelpRequestById,
  cancelHelpRequest
} from '../../integrations/supabase/helpRequests';
import { HelpRequest } from '../../types/helpRequest';
import { HelpSession } from '../../types/helpSession';
import { Profile } from '../../types/profile';
import { SessionMessage } from '../../types/sessionMessage';
import CodeEditor from '../CodeEditor';
import { useEmergencyRecovery } from '../../hooks/useEmergencyRecovery';
import { useRealtimeSessionMessages } from '../../hooks/realtime/useRealtimeSessionMessages';

interface HelpSessionInterfaceProps {
  // No props needed for now
}

const HelpSessionInterface: React.FC<HelpSessionInterfaceProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userId, userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<HelpSession | null>(null);
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [isEndingSession, setIsEndingSession] = useState<boolean>(false);
  const [isCodeEditorVisible, setCodeEditorVisible] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [client, setClient] = useState<Profile | null>(null);
  const [developer, setDeveloper] = useState<Profile | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [isCodeSending, setIsCodeSending] = useState<boolean>(false);
  const [isEmergencyRecoveryActive, setIsEmergencyRecoveryActive] = useState(false);
  
  const {
    realtimeMessages,
    realtimeError,
    realtimeLoading,
  } = useRealtimeSessionMessages(sessionId || '');
  
  useEmergencyRecovery();

  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await getHelpSessionDetails(sessionId);
      if (response.success && response.data) {
        setSession(response.data);
        setIsSessionActive(response.data.status === 'active');
        handleTicketDetails(response.data.request_id);
      } else {
        toast.error('Could not load session details');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('An error occurred while loading session details');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }

    try {
      const response = await getSessionMessages(sessionId);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        toast.error('Could not load session messages');
      }
    } catch (error) {
      console.error('Error fetching session messages:', error);
      toast.error('An error occurred while loading session messages');
    }
  }, [sessionId]);

  const handleTicketDetails = async (ticketId: string) => {
    try {
      const response = await getHelpRequestById(ticketId);
      
      if (response.success && response.data) {
        setTicket(response.data);
      } else {
        console.error('Error fetching ticket details:', response.error);
        toast.error('Could not load ticket details');
      }
    } catch (error) {
      console.error('Exception fetching ticket details:', error);
      toast.error('An error occurred while loading ticket details');
    }
  };

  const handleStartSession = async () => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }

    setIsStartingSession(true);
    try {
      const response = await startHelpSession(sessionId);
      if (response.success) {
        toast.success('Session started successfully!');
        setIsSessionActive(true);
        fetchSessionDetails();
      } else {
        toast.error('Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('An error occurred while starting the session');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }

    setIsEndingSession(true);
    try {
      const response = await endHelpSession(sessionId);
      if (response.success) {
        toast.success('Session ended successfully!');
        setIsSessionActive(false);
        fetchSessionDetails();
        navigate('/session-history');
      } else {
        toast.error('Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('An error occurred while ending the session');
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleSendMessage = async () => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }

    if (!newMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      const response = await sendMessage(sessionId, newMessage, userId || '', userType || 'client', false, null);
      if (response.success && response.data) {
        setNewMessage('');
        fetchMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending the message');
    }
  };

  const handleCodeUpdate = (code: string) => {
    setCodeSnippet(code);
  };

  const handleSendCode = async () => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }
  
    if (!codeSnippet.trim()) {
      toast.error('Code snippet cannot be empty');
      return;
    }
  
    setIsCodeSending(true);
    try {
      const response = await sendMessage(sessionId, codeSnippet, userId || '', userType || 'client', true, null);
      if (response.success && response.data) {
        setCodeSnippet('');
        fetchMessages();
        toast.success('Code snippet sent successfully!');
      } else {
        toast.error('Failed to send code snippet');
      }
    } catch (error) {
      console.error('Error sending code snippet:', error);
      toast.error('An error occurred while sending the code snippet');
    } finally {
      setIsCodeSending(false);
    }
  };

  const handleCopySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId)
        .then(() => {
          setIsCopied(true);
          toast.success('Session ID copied to clipboard!');
          setTimeout(() => setIsCopied(false), 3000);
        })
        .catch(err => {
          console.error("Could not copy session ID: ", err);
          toast.error('Failed to copy session ID');
        });
    }
  };

  const handleCancelHelpRequest = async () => {
    if (!ticket?.id) {
      toast.error('Ticket ID is missing');
      return;
    }
  
    setIsCancelling(true);
    try {
      const response = await cancelHelpRequest(ticket.id);
      if (response.success) {
        toast.success('Help request cancelled successfully!');
        navigate('/client-dashboard');
      } else {
        toast.error('Failed to cancel help request');
      }
    } catch (error) {
      console.error('Error cancelling help request:', error);
      toast.error('An error occurred while cancelling the help request');
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    fetchMessages();
  }, [fetchSessionDetails, fetchMessages]);

  useEffect(() => {
    if (realtimeMessages && realtimeMessages.length > 0) {
      setMessages(prevMessages => [...prevMessages, ...realtimeMessages]);
    }
    if (realtimeError) {
      console.error('Realtime message error:', realtimeError);
      toast.error('Failed to receive real-time message');
    }
  }, [realtimeMessages, realtimeError]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading session...</div>;
  }

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Session not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            Help Session Details
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopySessionId} 
              className="ml-2"
              disabled={isCopied}
            >
              {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Session ID:</strong> {sessionId}
            </div>
            <div>
              <strong>Status:</strong> <Badge variant={isSessionActive ? "default" : "secondary"}>{isSessionActive ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div>
              <strong>Created At:</strong> {new Date(session.created_at).toLocaleString()}
            </div>
            <div>
              <strong>Request ID:</strong> {session.request_id}
            </div>
            <div>
              <strong>Client ID:</strong> {session.client_id}
            </div>
            <div>
              <strong>Developer ID:</strong> {session.developer_id}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex gap-2">
            {!isSessionActive && userType === 'developer' && (
              <Button onClick={handleStartSession} disabled={isStartingSession}>
                {isStartingSession ? 'Starting...' : 'Start Session'}
              </Button>
            )}
            {isSessionActive && (
              <Button onClick={handleEndSession} disabled={isEndingSession}>
                {isEndingSession ? 'Ending...' : 'End Session'}
              </Button>
            )}
            {userType === 'client' && ticket?.status !== 'cancelled' && (
              <Button 
                variant="destructive" 
                onClick={handleCancelHelpRequest} 
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Help Request'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {ticket && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Title:</strong> {ticket.title}
              </div>
              <div>
                <strong>Status:</strong> {ticket.status}
              </div>
              <div>
                <strong>Description:</strong> {ticket.description}
              </div>
              <div>
                <strong>Urgency:</strong> {ticket.urgency}
              </div>
              <div>
                <strong>Technical Area:</strong> {ticket.technical_area.join(', ')}
              </div>
              <div>
                <strong>Budget Range:</strong> {ticket.budget_range}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 h-80 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 p-2 rounded-md ${msg.sender_id === userId ? 'bg-blue-100 ml-auto w-fit max-w-[75%]' : 'bg-gray-100 mr-auto w-fit max-w-[75%]'}`}>
                <div className="text-sm text-gray-500">
                  {msg.sender_id === userId ? 'You' : msg.sender_type}
                </div>
                {msg.is_code ? (
                  <pre className="whitespace-pre-wrap text-sm">
                    <code>{msg.content}</code>
                  </pre>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <div className="text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {realtimeLoading && <div className="text-center">Loading real-time messages...</div>}
            {realtimeError && <div className="text-center text-red-500">Error: {realtimeError}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <Button onClick={() => setCodeEditorVisible(true)}>
              Open Code Editor
            </Button>
            <Button onClick={handleSendCode} disabled={isCodeSending}>
              {isCodeSending ? 'Sending...' : 'Send Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isCodeEditorVisible && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <div className="flex justify-between items-center p-2 bg-gray-100">
            <h3 className="font-semibold">Code Editor</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCodeEditorVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CodeEditor 
            initialCode={ticket?.code_snippet || "// Type your code here"}
            onUpdate={handleCodeUpdate} 
          />
        </div>
      )}
    </div>
  );
};

export default HelpSessionInterface;
