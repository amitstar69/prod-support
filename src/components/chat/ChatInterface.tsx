
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/auth';
import { ChatMessage, fetchChatMessages, sendChatMessage, setupChatMessagesSubscription } from '../../integrations/supabase/chat';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  helpRequestId: string;
  otherId: string;
  otherName?: string;
  otherAvatar?: string;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  helpRequestId, 
  otherId,
  otherName = 'User',
  otherAvatar = '/placeholder.svg',
  onClose
}) => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId && helpRequestId && otherId) {
      loadChatMessages();
      
      // Setup realtime subscription
      const cleanup = setupChatMessagesSubscription(
        helpRequestId, 
        userId, 
        (newMessage) => {
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      );
      
      return cleanup;
    }
  }, [userId, helpRequestId, otherId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const loadChatMessages = async () => {
    if (!userId || !helpRequestId) return;
    
    setIsLoading(true);
    
    try {
      const result = await fetchChatMessages(helpRequestId, userId);
      
      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Error loading chat messages:', result.error);
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Exception loading chat messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !otherId || !helpRequestId) return;
    
    try {
      setIsSending(true);
      
      const result = await sendChatMessage(
        helpRequestId,
        userId,
        otherId,
        newMessage
      );
      
      if (result.success) {
        setNewMessage('');
      } else {
        toast.error(`Failed to send message: ${result.error}`);
      }
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
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${message.sender_id === userId ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender_id === userId ? undefined : otherAvatar} />
                <AvatarFallback>
                  {message.sender_id === userId ? 'Me' : otherName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div 
                  className={`${message.sender_id === userId ? 
                    'bg-primary text-primary-foreground' : 
                    'bg-muted text-foreground'} 
                    p-3 rounded-lg`}
                >
                  <p className="text-sm">{message.message}</p>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${message.sender_id === userId ? 'text-right' : 'text-left'}`}>
                  {message.sender_id === userId ? 'You' : otherName} • {formatTime(message.created_at)}
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
