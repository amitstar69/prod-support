
import { supabase } from './client';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  help_request_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchChatMessages = async (helpRequestId: string, userId: string) => {
  try {
    if (!helpRequestId || !userId) {
      return { success: false, error: 'Help request ID and User ID are required', data: [] };
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('help_request_id', helpRequestId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data as ChatMessage[] };
  } catch (error) {
    console.error('Exception fetching chat messages:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
};

export const sendChatMessage = async (
  helpRequestId: string, 
  senderId: string, 
  receiverId: string, 
  message: string
) => {
  try {
    if (!helpRequestId || !senderId || !receiverId || !message.trim()) {
      return { success: false, error: 'Missing required fields' };
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        help_request_id: helpRequestId,
        sender_id: senderId,
        receiver_id: receiverId,
        message: message.trim()
      })
      .select();

    if (error) {
      console.error('Error sending chat message:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] as ChatMessage };
  } catch (error) {
    console.error('Exception sending chat message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const markMessagesAsRead = async (helpRequestId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('help_request_id', helpRequestId)
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception marking messages as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Setup realtime subscription for chat messages
export const setupChatMessagesSubscription = (
  helpRequestId: string, 
  userId: string, 
  callback: (message: ChatMessage) => void
) => {
  console.log('Setting up chat messages subscription for request:', helpRequestId);
  
  if (!helpRequestId || !userId) {
    console.error('Help request ID and User ID are required for chat subscription');
    return () => {};
  }
  
  try {
    const channel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `help_request_id=eq.${helpRequestId}`
        },
        (payload) => {
          console.log('New chat message received:', payload);
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe((status) => {
        console.log('Chat messages subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to chat messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to chat messages');
          toast.error('Could not connect to chat updates. Please refresh.');
        }
      });
      
    // Return the cleanup function
    return () => {
      console.log('Cleaning up chat messages subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Exception setting up chat messages subscription:', error);
    toast.error('Chat connection failed. Some features may not work.');
    return () => {}; // Return empty cleanup function
  }
};
