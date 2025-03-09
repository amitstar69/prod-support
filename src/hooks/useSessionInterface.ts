
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { 
  startSession,
  endSession,
  sendChatMessage,
  getSessionMessages,
  updateSharedCode,
  subscribeToSessionMessages,
  subscribeToSessionUpdates
} from '../integrations/supabase/sessionManager';
import { useAuth } from '../contexts/auth';
import { ChatMessage } from '../types/product';

export const useSessionInterface = (sessionId: string) => {
  const { userId, userType } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [helpRequest, setHelpRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [sharedCode, setSharedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [activeTab, setActiveTab] = useState('code');

  // Fetch session data
  const fetchSessionData = useCallback(async () => {
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
        return;
      }
      
      setSession(sessionData);
      
      if (sessionData.shared_code) {
        setSharedCode(sessionData.shared_code);
      }
      
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
        
        // If the request has code, set it as the shared code
        if (requestData.code_snippet && !sessionData.shared_code) {
          setSharedCode(requestData.code_snippet);
          updateSharedCode(sessionId, requestData.code_snippet);
        }
      }
      
      // Fetch session messages
      const sessionMessages = await getSessionMessages(sessionId);
      setMessages(sessionMessages);
      
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
  }, [sessionId]);

  // Initialize session data
  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!sessionId) return;
    
    // Subscribe to session messages
    const messagesChannel = subscribeToSessionMessages(sessionId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
    
    // Subscribe to session updates
    const sessionChannel = subscribeToSessionUpdates(sessionId, (updatedSession) => {
      setSession(updatedSession);
      
      // Update session running state if needed
      if (updatedSession.status === 'in-progress' && !isSessionRunning) {
        setIsSessionRunning(true);
      } else if (updatedSession.status === 'completed') {
        setIsSessionRunning(false);
      }
      
      // Update shared code if it changed
      if (updatedSession.shared_code !== sharedCode) {
        setSharedCode(updatedSession.shared_code || '');
      }
    });
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, isSessionRunning, sharedCode]);

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

  // Handler for starting a session
  const handleStartSession = async () => {
    if (!session || !userId) return;
    
    try {
      setIsSavingSession(true);
      
      const result = await startSession(sessionId);
      
      if (result) {
        setIsSessionRunning(true);
        toast.success('Session started successfully!');
      }
      
    } catch (error) {
      console.error('Exception starting session:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSavingSession(false);
    }
  };

  // Handler for pausing/resuming a session
  const handlePauseResumeSession = () => {
    setIsSessionRunning(prev => !prev);
    toast.info(isSessionRunning ? 'Session paused' : 'Session resumed');
  };

  // Handler for ending a session
  const handleEndSession = async () => {
    if (!session || !userId) return;
    
    try {
      setIsSavingSession(true);
      
      // Calculate final cost based on elapsed time and rate
      const minutesElapsed = Math.ceil(elapsedTime / 60);
      const hourlyRate = 75; // Default rate in USD
      const finalCost = (hourlyRate / 60) * minutesElapsed;
      
      const result = await endSession(sessionId, finalCost);
      
      if (result) {
        setIsSessionRunning(false);
        toast.success('Session completed successfully!');
      }
      
    } catch (error) {
      console.error('Exception ending session:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSavingSession(false);
    }
  };

  // Handler for sending a message
  const handleSendMessage = async (content: string, isCode: boolean = false) => {
    if (!userId || !session) return;
    
    const userRole = userType === 'developer' ? 'developer' : 'client';
    
    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      sessionId,
      senderId: userId,
      senderType: userRole,
      content,
      isCode
    };
    
    const result = await sendChatMessage(message);
    return result;
  };

  // Handler for updating shared code
  const handleUpdateCode = async (code: string) => {
    setSharedCode(code);
    await updateSharedCode(sessionId, code);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current cost
  const calculateCurrentCost = () => {
    const hourlyRate = 75; // Default rate in USD
    return ((hourlyRate / 60) * Math.ceil(elapsedTime / 60)).toFixed(2);
  };

  return {
    session,
    helpRequest,
    messages,
    sharedCode,
    isLoading,
    elapsedTime,
    isSessionRunning,
    isSavingSession,
    activeTab,
    setActiveTab,
    handleStartSession,
    handlePauseResumeSession,
    handleEndSession,
    handleSendMessage,
    handleUpdateCode,
    formatTime,
    calculateCurrentCost,
    fetchSessionData
  };
};
