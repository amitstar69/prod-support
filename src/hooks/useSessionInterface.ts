
// This file will implement the session interface functionality
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { 
  startSession, 
  endSession, 
  sendChatMessage, 
  subscribeToSessionUpdates 
} from '../integrations/supabase/sessionManager';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth';

export const useSessionInterface = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userId, userType } = useAuth();
  
  const [sessionData, setSessionData] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [developerData, setDeveloperData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('');
  const [codeValue, setCodeValue] = useState('');
  
  // For timer/cost calculation
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cost, setCost] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  
  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;
      
      try {
        const { data, error } = await supabase
          .from('help_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (error) throw error;
        
        setSessionData(data);
        setSessionStatus(data.status);
        
        // Handle shared code if it exists
        // Currently `shared_code` doesn't exist in the database schema
        // This is a temporary solution until the schema is updated
        const sharedCode = data.shared_code || '// Add your code here';
        setCodeValue(sharedCode);
        
        // Fetch the associated help request
        const { data: requestData, error: requestError } = await supabase
          .from('help_requests')
          .select('*')
          .eq('id', data.request_id)
          .single();
          
        if (requestError) throw requestError;
        
        setRequestData(requestData);
        
        // Fetch client profile
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.client_id)
          .single();
          
        if (clientError) throw clientError;
        
        setClientData(clientData);
        
        // Fetch developer profile
        const { data: developerData, error: developerError } = await supabase
          .from('profiles')
          .select('*, developer_profiles(*)')
          .eq('id', data.developer_id)
          .single();
          
        if (developerError) throw developerError;
        
        setDeveloperData(developerData);
        setHourlyRate(developerData.developer_profiles?.[0]?.hourly_rate || 75);
        
        // Set session start time if the session is in progress
        if (data.status === 'in-progress' && data.actual_start) {
          setSessionStartTime(new Date(data.actual_start));
        }
        
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast.error('Failed to load session data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId]);
  
  // Subscribe to session updates
  useEffect(() => {
    if (!sessionId) return;
    
    const channel = subscribeToSessionUpdates(sessionId, (sessionUpdate) => {
      setSessionStatus(sessionUpdate.status);
      
      if (sessionUpdate.status === 'in-progress' && sessionUpdate.actual_start) {
        setSessionStartTime(new Date(sessionUpdate.actual_start));
      }
      
      if (sessionUpdate.status === 'completed') {
        setSessionStartTime(null);
      }
      
      // Update session data with the new values
      setSessionData(prev => ({ ...prev, ...sessionUpdate }));
    });
    
    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);
  
  // Timer logic for calculating elapsed time and cost
  useEffect(() => {
    if (!sessionStartTime || sessionStatus !== 'in-progress') return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = (now.getTime() - sessionStartTime.getTime()) / 1000; // in seconds
      setElapsedTime(elapsed);
      
      // Calculate cost based on hourly rate
      // Convert hourly rate to per-second rate, then multiply by elapsed seconds
      const secondRate = hourlyRate / 3600;
      setCost(secondRate * elapsed);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [sessionStartTime, sessionStatus, hourlyRate]);
  
  // Functions for session control
  const handleStartSession = async () => {
    if (!sessionId) return;
    
    try {
      const updatedSession = await startSession(sessionId);
      if (updatedSession) {
        toast.success('Session started successfully');
        setSessionStartTime(new Date(updatedSession.actual_start));
        setSessionStatus('in-progress');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };
  
  const handleEndSession = async () => {
    if (!sessionId) return;
    
    try {
      const finalCost = Math.ceil(cost); // Round up to nearest dollar
      const updatedSession = await endSession(sessionId, finalCost);
      
      if (updatedSession) {
        toast.success('Session ended successfully');
        setSessionStartTime(null);
        setSessionStatus('completed');
        setCost(finalCost); // Set the final cost
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };
  
  // Function to send a chat message
  const handleSendMessage = async (content: string, isCode: boolean = false) => {
    if (!sessionId || !userId) return;
    
    try {
      toast.info('Message sending will be available after database setup');
      
      // Add message to local state for UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        senderId: userId,
        senderType: userType as 'developer' | 'client',
        content,
        timestamp: new Date().toISOString(),
        isCode
      };
      
      setChatMessages(prev => [...prev, tempMessage]);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };
  
  // Function to update shared code
  const handleUpdateCode = async (code: string) => {
    setCodeValue(code);
    // We'll implement this when the database schema has been updated
    console.log('Code updated locally:', code);
  };
  
  return {
    sessionData,
    requestData,
    clientData,
    developerData,
    chatMessages,
    isLoading,
    sessionStatus,
    codeValue,
    elapsedTime,
    cost,
    handleStartSession,
    handleEndSession,
    handleSendMessage,
    handleUpdateCode,
    isClient: userType === 'client',
    isDeveloper: userType === 'developer',
  };
};

export default useSessionInterface;
