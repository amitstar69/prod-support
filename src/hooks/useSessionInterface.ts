
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { HelpSession } from '../types/helpSession';
import { ApiResponse } from '../integrations/supabase/helpRequests';
import { 
  endHelpSession, 
  finalizeHelpSession,
  sendChatMessage
} from '../integrations/supabase/sessionManager';
import { getHelpSessionDetails } from '../integrations/supabase/helpRequests';

export interface UseSessionInterfaceResult {
  session: HelpSession | null;
  isLoading: boolean;
  startSession: () => Promise<boolean>;
  endSession: () => Promise<boolean>;
  sendMessage: (content: string) => Promise<boolean>;
}

export const useSessionInterface = (sessionId: string): UseSessionInterfaceResult => {
  const [session, setSession] = useState<HelpSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await getHelpSessionDetails(sessionId);
      if (response.success && response.data) {
        setSession(response.data as HelpSession);
      } else {
        toast.error('Failed to load session details');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('An error occurred while loading session details');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  const startSession = async (): Promise<boolean> => {
    // This would typically call some API to start the session
    // We'll just return true for now
    return true;
  };

  const endSession = async (): Promise<boolean> => {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return false;
    }

    try {
      const response = await endHelpSession(sessionId);
      if (response.success) {
        toast.success('Session ended successfully');
        fetchSessionDetails();
        return true;
      } else {
        toast.error('Failed to end session');
        return false;
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('An error occurred while ending the session');
      return false;
    }
  };

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!sessionId || !session) {
      toast.error('Session information is missing');
      return false;
    }

    try {
      // We'd use sendChatMessage, but for now we'll just return true
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending the message');
      return false;
    }
  };

  return {
    session,
    isLoading,
    startSession,
    endSession,
    sendMessage
  };
};
