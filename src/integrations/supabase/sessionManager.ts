
import { supabase } from './client';
import { toast } from 'sonner';
import { ActiveSession, ChatMessage, SessionRequest } from '../../types/product';

// Create a new session request
export const createSessionRequest = async (sessionRequest: Omit<SessionRequest, 'id' | 'requestedAt' | 'status'>) => {
  try {
    const newSessionRequest = {
      ...sessionRequest,
      requestedAt: new Date().toISOString(),
      status: 'pending' as const
    };

    const { data, error } = await supabase
      .from('help_sessions')
      .insert({
        request_id: sessionRequest.helpRequestId,
        developer_id: sessionRequest.developerId,
        client_id: sessionRequest.clientId,
        scheduled_start: sessionRequest.scheduledStartTime,
        scheduled_end: sessionRequest.scheduledEndTime,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session request:', error);
      toast.error('Failed to create session request');
      return null;
    }

    // Update help request status to show it's scheduled
    await supabase
      .from('help_requests')
      .update({ status: 'scheduled' })
      .eq('id', sessionRequest.helpRequestId);

    return data;
  } catch (error) {
    console.error('Exception creating session request:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Accept a session request
export const acceptSessionRequest = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from('help_sessions')
      .update({ status: 'accepted' })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error accepting session request:', error);
      toast.error('Failed to accept session request');
      return null;
    }

    toast.success('Session request accepted');
    return data;
  } catch (error) {
    console.error('Exception accepting session request:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Start an active session
export const startSession = async (sessionId: string) => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('help_sessions')
      .update({
        status: 'in-progress',
        actual_start: now
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
      return null;
    }

    // Also update the help request status
    await supabase
      .from('help_requests')
      .update({ status: 'in-progress' })
      .eq('id', data.request_id);

    toast.success('Session started successfully');
    return data;
  } catch (error) {
    console.error('Exception starting session:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// End an active session
export const endSession = async (sessionId: string, finalCost?: number) => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('help_sessions')
      .update({
        status: 'completed',
        actual_end: now,
        final_cost: finalCost
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
      return null;
    }

    // Also update the help request status
    await supabase
      .from('help_requests')
      .update({ status: 'completed' })
      .eq('id', data.request_id);

    toast.success('Session completed successfully');
    return data;
  } catch (error) {
    console.error('Exception ending session:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Send a chat message
export const sendChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  try {
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('session_messages')
      .insert({
        session_id: message.sessionId,
        sender_id: message.senderId,
        sender_type: message.senderType,
        content: message.content,
        is_code: message.isCode || false,
        attachment_url: message.attachmentUrl
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception sending message:', error);
    return null;
  }
};

// Get all messages for a session
export const getSessionMessages = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching session messages:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching session messages:', error);
    return [];
  }
};

// Update shared code in a session
export const updateSharedCode = async (sessionId: string, code: string) => {
  try {
    const { error } = await supabase
      .from('help_sessions')
      .update({ shared_code: code })
      .eq('id', sessionId);
      
    if (error) {
      console.error('Error updating shared code:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating shared code:', error);
    return false;
  }
};

// Get all sessions for a user (either as developer or client)
export const getUserSessions = async (userId: string, role: 'developer' | 'client') => {
  try {
    const column = role === 'developer' ? 'developer_id' : 'client_id';
    
    const { data, error } = await supabase
      .from('help_sessions')
      .select(`
        *,
        help_requests(*)
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Exception fetching user sessions:', error);
    return [];
  }
};

// Setup real-time chat subscription
export const subscribeToSessionMessages = (sessionId: string, onNewMessage: (message: any) => void) => {
  const channel = supabase
    .channel(`session-messages-${sessionId}`)
    .on('postgres_changes', 
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${sessionId}`
      }, 
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();
    
  return channel;
};

// Setup real-time session updates subscription
export const subscribeToSessionUpdates = (sessionId: string, onUpdate: (session: any) => void) => {
  const channel = supabase
    .channel(`session-updates-${sessionId}`)
    .on('postgres_changes', 
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'help_sessions',
        filter: `id=eq.${sessionId}`
      }, 
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
    
  return channel;
};

// Create a session summary
export const createSessionSummary = async (
  sessionId: string, 
  topics: string[], 
  solution: string, 
  rating?: number, 
  feedback?: string
) => {
  try {
    const { data: session, error: sessionError } = await supabase
      .from('help_sessions')
      .select(`
        *,
        help_requests(*),
        client:client_id(name),
        developer:developer_id(name)
      `)
      .eq('id', sessionId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session for summary:', sessionError);
      return null;
    }

    // Calculate duration in minutes
    const startTime = new Date(session.actual_start).getTime();
    const endTime = new Date(session.actual_end).getTime();
    const durationMs = endTime - startTime;
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    
    const { data, error } = await supabase
      .from('session_summaries')
      .insert({
        session_id: sessionId,
        developer_id: session.developer_id,
        developer_name: session.developer.name,
        client_id: session.client_id,
        client_name: session.client.name,
        topics: topics,
        solution: solution,
        duration: durationMinutes,
        cost: session.final_cost,
        rating: rating,
        feedback: feedback
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating session summary:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception creating session summary:', error);
    return null;
  }
};
