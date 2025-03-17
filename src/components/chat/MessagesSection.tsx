
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { fetchChatMessages } from '../../integrations/supabase/chat';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Inbox, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChatDialog from './ChatDialog';

interface ChatPreview {
  helpRequestId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
}

const MessagesSection: React.FC = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<ChatPreview | null>(null);

  useEffect(() => {
    if (userId) {
      loadChatPreviews();
    }
  }, [userId]);

  const loadChatPreviews = async () => {
    setIsLoading(true);
    try {
      // Get all chat conversations for this user (both as sender and receiver)
      const { data: chatSessions, error } = await supabase
        .from('chat_messages')
        .select('help_request_id, sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        setIsLoading(false);
        return;
      }

      // Extract unique conversations
      const uniqueConversations = new Map();
      chatSessions?.forEach(session => {
        const helpRequestId = session.help_request_id;
        const otherUserId = session.sender_id === userId ? session.receiver_id : session.sender_id;
        const key = `${helpRequestId}_${otherUserId}`;
        
        if (!uniqueConversations.has(key)) {
          uniqueConversations.set(key, {
            helpRequestId,
            otherUserId
          });
        }
      });

      // Fetch profile information for each conversation
      const previews: ChatPreview[] = [];
      
      for (const [_, convo] of uniqueConversations.entries()) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, image')
          .eq('id', convo.otherUserId)
          .single();

        // Get last message and unread count
        const { data: messages } = await fetchChatMessages(convo.helpRequestId, userId!);
        
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const unreadCount = messages.filter(m => m.receiver_id === userId && !m.is_read).length;

        previews.push({
          helpRequestId: convo.helpRequestId,
          otherUserId: convo.otherUserId,
          otherUserName: profile?.name || 'User',
          otherUserAvatar: profile?.image || '/placeholder.svg',
          lastMessage: lastMessage?.message,
          lastMessageDate: lastMessage?.created_at,
          unreadCount
        });
      }

      setChatPreviews(previews);
    } catch (error) {
      console.error('Error loading chat previews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = (chat: ChatPreview) => {
    setCurrentChat(chat);
    setChatDialogOpen(true);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadChatPreviews}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {chatPreviews.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground max-w-sm">
                You haven't exchanged any messages with clients yet. When you do, they'll appear here.
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[450px]">
              {chatPreviews.map((chat) => (
                <Card 
                  key={`${chat.helpRequestId}_${chat.otherUserId}`}
                  className={`mb-3 cursor-pointer transition-colors hover:bg-muted/50 ${chat.unreadCount > 0 ? 'border-primary/30 bg-primary/5' : ''}`}
                  onClick={() => handleOpenChat(chat)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={chat.otherUserAvatar} />
                        <AvatarFallback>{chat.otherUserName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{chat.otherUserName}</CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(chat.lastMessageDate)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="min-w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          )}
        </TabsContent>
        <TabsContent value="unread">
          {chatPreviews.filter(chat => chat.unreadCount > 0).length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No unread messages</h3>
              <p className="text-muted-foreground max-w-sm">
                You're all caught up! Any new unread messages will appear here.
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[450px]">
              {chatPreviews
                .filter(chat => chat.unreadCount > 0)
                .map((chat) => (
                  <Card 
                    key={`${chat.helpRequestId}_${chat.otherUserId}`}
                    className="mb-3 cursor-pointer transition-colors hover:bg-muted/50 border-primary/30 bg-primary/5"
                    onClick={() => handleOpenChat(chat)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={chat.otherUserAvatar} />
                          <AvatarFallback>{chat.otherUserName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{chat.otherUserName}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastMessageDate)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </div>
                        </div>
                        <div className="min-w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                          {chat.unreadCount}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {currentChat && (
        <ChatDialog 
          isOpen={chatDialogOpen}
          onClose={() => {
            setChatDialogOpen(false);
            loadChatPreviews(); // Refresh the list to update unread counts
          }}
          helpRequestId={currentChat.helpRequestId}
          otherId={currentChat.otherUserId}
          otherName={currentChat.otherUserName}
          otherAvatar={currentChat.otherUserAvatar}
        />
      )}
    </div>
  );
};

export default MessagesSection;
