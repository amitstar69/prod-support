import { supabase } from './client';
import { ApiResponse } from './helpRequests';
import { SessionMessage } from '../types/sessionMessage';

export const getUserSessions = async (userId: string, userRole: 'client' | 'developer'): Promise<any[]> => {
  try {
    const field = userRole === 'client' ? 'client_id' : 'developer_id';
    
    const { data, error } = await supabase
      .from('help_sessions')
      .select(`
        *,
        help_requests(*)
      `)
      .eq(field, userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getUserSessions:', error);
    return [];
  }
};

export const createSessionRequest = async (sessionData: {
  helpRequestId: string;
  developerId: string;
  clientId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  message?: string;
}): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('help_sessions')
      .insert({
        request_id: sessionData.helpRequestId,
        developer_id: sessionData.developerId,
        client_id: sessionData.clientId,
        scheduled_start: sessionData.scheduledStartTime,
        scheduled_end: sessionData.scheduledEndTime,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session request:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in createSessionRequest:', error);
    return null;
  }
};

/**
 * Ends a help session and updates the session status in the database.
 */
export const endHelpSession = async (sessionId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('help_sessions')
      .update({ status: 'completed', actual_end: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending help session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in endHelpSession:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Calculates the duration of a help session in minutes.
 */
const calculateSessionDuration = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return Math.round((endTime - startTime) / (1000 * 60));
};

/**
 * Extracts topics discussed from session messages.
 */
const getTopicsFromMessages = (messages: any[]): string[] => {
  // Basic implementation: Extract the first few words from each message
  return messages.map(msg => msg.content.split(' ').slice(0, 5).join(' '));
};

/**
 * Extracts the solution provided from session messages.
 */
const getSolutionFromMessages = (messages: any[]): string | null => {
  // Basic implementation: Return the last message as the solution
  if (messages.length > 0) {
    return messages[messages.length - 1].content;
  }
  return null;
};

/**
 * Creates a summary of the help session, including topics discussed,
 * solution provided, and cost.
 */
const createSummary = async (
  session: any,
  client: any,
  developer: any,
  duration: number,
  messages: any[]
): Promise<ApiResponse<any>> => {
  try {
    // Extract relevant information for the summary
    const summaryData = {
      session_id: session.id,
      client_id: client?.id || 'unknown',
      client_name: client?.name || 'Unknown Client',
      developer_id: developer?.id || 'unknown',
      developer_name: developer?.name || 'Unknown Developer',
      duration,
      topics: getTopicsFromMessages(messages),
      solution: getSolutionFromMessages(messages),
    };

    // Insert the summary into the database
    const { data, error } = await supabase
      .from('session_summaries')
      .insert([summaryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating session summary:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in createSummary:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Finalizes a help session by ending the session, calculating the cost,
 * and creating a session summary.
 */
export const finalizeHelpSession = async (sessionId: string): Promise<ApiResponse<any>> => {
  try {
    // Retrieve the session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('help_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session details:', sessionError);
      return { success: false, error: sessionError.message };
    }

    if (!sessionData) {
      return { success: false, error: 'Session not found' };
    }

    // End the help session
    const endSessionResult = await endHelpSession(sessionId);
    if (!endSessionResult.success) {
      return endSessionResult;
    }

    // Retrieve client and developer profiles
    const { data: clientData, error: clientError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.client_id)
      .single();

    const { data: developerData, error: developerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.developer_id)
      .single();

    if (clientError || developerError) {
      console.error('Error fetching profiles:', clientError, developerError);
      return { success: false, error: 'Failed to fetch user profiles' };
    }

    // Calculate session duration
    const duration = calculateSessionDuration(sessionData.created_at, new Date().toISOString());

    // Fetch all messages from the session
     const { data: messages, error: messagesError } = await supabase
       .from('session_messages')
       .select('*')
       .eq('session_id', sessionId)
       .order('created_at', { ascending: true });

     if (messagesError) {
       console.error('Error fetching session messages:', messagesError);
       return { success: false, error: 'Failed to fetch session messages' };
     }

    // Create a session summary
    const summaryResult = await createSummary(sessionData, clientData, developerData, duration, messages || []);
    if (!summaryResult.success) {
      return summaryResult;
    }

    return { success: true, data: summaryResult.data };
  } catch (error) {
    console.error('Exception in finalizeHelpSession:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Fetches all messages for a specific help session.
 */
export const getSessionMessages = async (sessionId: string): Promise<SessionMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('session_messages')
      .select(`
        *,
        profiles:sender_id(id, name, image)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching session messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getSessionMessages:', error);
    return [];
  }
};

/**
 * Subscribes to real-time updates of session messages.
 */
export const subscribeToSessionMessages = (sessionId: string, callback: (newMessage: any) => void) => {
  const channel = supabase
    .channel(`session_messages:${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'session_messages',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Sends a chat message to a help session.
 */
export const sendChatMessage = async (
  sessionId: string, 
  message: string, 
  senderId: string, 
  senderType: string,
  isCode: boolean = false
): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('session_messages')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        sender_type: senderType,
        content: message,
        is_code: isCode
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending chat message:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in sendChatMessage:', error);
    return { success: false, error: String(error) };
  }
};
