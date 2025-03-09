
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { sendChatMessage, getSessionMessages, subscribeToSessionMessages } from '../../integrations/supabase/sessionManager';
import { Loader2, Send, PaperclipIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  sender_type: 'developer' | 'client' | 'system';
  is_code?: boolean;
  attachment_url?: string;
}

interface ChatInterfaceProps {
  sessionId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchMessages();
    fetchUserProfile();
    
    // Subscribe to real-time messages
    const subscription = subscribeToSessionMessages(sessionId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
    
    // Scroll to bottom on initial load
    scrollToBottom();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const fetchedMessages = await getSessionMessages(sessionId);
      
      // If we don't have any messages yet, add a welcome message
      if (fetchedMessages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            session_id: sessionId,
            sender_id: 'system',
            sender_type: 'system',
            content: 'Welcome to your help session! You can start chatting with your assigned developer/client here.',
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !userProfile) return;
    
    try {
      setIsSending(true);
      
      // Determine user type from the profile
      const senderType = userProfile.user_type === 'developer' ? 'developer' : 'client';
      
      await sendChatMessage({
        sessionId: sessionId,
        senderId: userId,
        senderType: senderType,
        content: newMessage,
        isCode: false
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  const getSenderName = (message: ChatMessage) => {
    if (message.sender_type === 'system') return 'System';
    return message.sender_id === userId ? 'You' : message.sender_name || 'User';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${message.sender_id === userId ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender_avatar} />
                <AvatarFallback>
                  {getSenderName(message).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div 
                  className={`${message.sender_id === userId ? 
                    'bg-primary text-primary-foreground' : 
                    message.sender_type === 'system' ?
                    'bg-secondary text-secondary-foreground' :
                    'bg-muted text-foreground'} 
                    p-3 rounded-lg ${message.is_code ? 'font-mono text-xs' : ''}`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${message.sender_id === userId ? 'text-right' : 'text-left'}`}>
                  {getSenderName(message)} • {formatTime(message.created_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
            >
              <PaperclipIcon className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              className="rounded-full"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
