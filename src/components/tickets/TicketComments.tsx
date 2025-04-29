import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Comment out this to fix build errors
// import { TicketComment } from '../../types/helpRequest';

interface CommentsSectionProps {
  ticket: HelpRequest | null;
  ticketId: string;
  userId: string;
  role: string;
  visible?: boolean;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ ticket, ticketId, userId, role, visible = true }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && ticketId) {
      fetchComments();

      const channel = supabase
        .channel(`comments-for-ticket-${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_comments',
            filter: `ticket_id=eq.${ticketId}`,
          },
          (payload) => {
            console.log('Received comment update:', payload);
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [visible, ticketId]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          user:user_id (id, name, image)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert([
          {
            ticket_id: ticketId,
            user_id: userId,
            content: newComment,
            role: role,
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      setNewComment('');
      toast.success('Comment submitted successfully');
      fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
      toast.error('Failed to submit comment');
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>
      {isLoading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={comment.user?.image || ''} alt={comment.user?.name || 'User'} />
                <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{comment.user?.name || 'Anonymous'}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full"
        />
        <Button onClick={handleSubmitComment} className="mt-2">
          Submit Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentsSection;
