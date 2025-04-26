
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TicketCommentsPanelProps {
  ticketId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

const TicketCommentsPanel: React.FC<TicketCommentsPanelProps> = ({ ticketId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`ticket_comments_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          console.log('Ticket comment changed, refreshing comments');
          fetchComments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching ticket comments:', error);
        return;
      }
      
      setComments(data || []);
      
      // Fetch user profiles for each comment
      const userIds = [...new Set((data || []).map(comment => comment.user_id))];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (!profilesError && profiles) {
          const nameMap = profiles.reduce((acc: Record<string, string>, profile) => {
            acc[profile.id] = profile.name;
            return acc;
          }, {});
          
          setUserNames(nameMap);
        }
      }
      
    } catch (err) {
      console.error('Exception fetching ticket comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to comment');
        return;
      }
      
      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          content: newComment.trim()
        });
        
      if (error) {
        console.error('Error submitting comment:', error);
        toast.error('Failed to submit comment');
        return;
      }
      
      toast.success('Comment added successfully');
      setNewComment('');
      fetchComments(); // Refresh comments
      
    } catch (err) {
      console.error('Exception submitting comment:', err);
      toast.error('An error occurred while submitting your comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Post Comment'}
            </Button>
          </div>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-medium">Previous Comments</h4>
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">
                        {userNames[comment.user_id] || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCommentsPanel;
