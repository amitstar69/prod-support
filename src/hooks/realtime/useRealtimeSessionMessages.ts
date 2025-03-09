
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { SessionMessage } from '../../types/sessionMessage';

export const useRealtimeSessionMessages = (sessionId: string) => {
  const [realtimeMessages, setRealtimeMessages] = useState<SessionMessage[]>([]);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) return;

    setRealtimeLoading(true);

    const channel = supabase
      .channel('session-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as SessionMessage;
          setRealtimeMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeLoading(false);
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeError('Failed to subscribe to real-time updates');
          setRealtimeLoading(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return {
    realtimeMessages,
    realtimeError,
    realtimeLoading,
  };
};
