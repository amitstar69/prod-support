
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { Loader2, Send, PaperclipIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dummy data for demo purposes
  const dummyMessages: ChatMessage[] = [
    {
      id: '1',
      session_id: sessionId,
      sender_id: 'client-123',
      sender_name: 'Alex Johnson',
      sender_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      content: 'Hi! Thanks for helping me with my React Router issue.',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
    },
    {
      id: '2',
      session_id: sessionId,
      sender_id: userId || 'developer-123',
      sender_name: 'You',
      content: 'No problem! I took a look at your code and I think I see the issue. Can you explain what happens when you try to navigate to a nested route?',
      created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString() // 9 minutes ago
    },
    {
      id: '3',
      session_id: sessionId,
      sender_id: 'client-123',
      sender_name: 'Alex Johnson',
      sender_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      content: 'When I click on a link to "/dashboard/settings", the URL changes but the component doesn\'t update. I have to refresh the page to see the settings component.',
      created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString() // 8 minutes ago
    }
  ];

  useEffect(() => {
    // In a real implementation, fetch messages from supabase
    // This is using dummy data for demonstration
    setTimeout(() => {
      setMessages(dummyMessages);
      setIsLoading(false);
    }, 1000);
    
    // Scroll to bottom on initial load
    scrollToBottom();
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    
    try {
      setIsSending(true);
      
      // Create a new message object
      const newMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        sender_id: userId,
        sender_name: 'You', // In a real app, get this from user profile
        content: newMessage,
        created_at: new Date().toISOString()
      };
      
      // Optimistically add to UI
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // In a real implementation, save to supabase
      // For demo, just simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error sending message:', error);
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
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${message.sender_id === userId ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender_avatar} />
                <AvatarFallback>
                  {message.sender_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div 
                  className={`${message.sender_id === userId ? 
                    'bg-primary text-primary-foreground' : 
                    'bg-muted text-foreground'} 
                    p-3 rounded-lg`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${message.sender_id === userId ? 'text-right' : 'text-left'}`}>
                  {message.sender_id === userId ? 'You' : message.sender_name} • {formatTime(message.created_at)}
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
