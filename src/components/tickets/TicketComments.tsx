
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getTicketComments, addTicketComment } from "../../integrations/supabase/ticketComments";
import { supabase } from "../../integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import type { TicketComment } from "../../types/helpRequest";

type Props = {
  ticketId: string;
  userRole: "client" | "developer";
  userId: string;
};

type CommentUser = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
};

const fetchUserProfile = async (userId: string): Promise<CommentUser | null> => {
  // Fetch user from profiles table
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,image,email")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    return null;
  }
  return data ? data : null;
};

const formatRelativeTime = (timeString: string) => {
  const date = new Date(timeString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
};

export const TicketComments: React.FC<Props> = ({
  ticketId,
  userRole,
  userId,
}) => {
  const [comments, setComments] = useState<Array<TicketComment & { user?: CommentUser }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch comments on mount/when ticket changes
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    const response = await getTicketComments(ticketId);
    if (!response.success) {
      toast.error("Failed to load comments");
      setIsLoading(false);
      return;
    }
    let data = response.data || [];
    // Filter internal notes for clients
    if (userRole === "client") {
      data = data.filter((c) => !c.is_internal);
    }
    // Hydrate users
    const userMap: Record<string, CommentUser> = {};
    await Promise.all(
      Array.from(new Set(data.map((c) => c.user_id))).map(async (uid) => {
        const p = await fetchUserProfile(uid);
        if (p && p.id) userMap[p.id] = p;
      })
    );
    setComments(
      data.map((c) => ({
        ...c,
        user: userMap[c.user_id],
      }))
    );
    setIsLoading(false);
  }, [ticketId, userRole]);

  useEffect(() => {
    fetchComments();
    // Real-time comments subscription
    const channel = supabase
      .channel(`ticket-comments-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ticket_comments",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // For clients, don't show internal
            if (userRole === "client" && payload.new.is_internal) return;
            // Fetch user for this comment
            fetchUserProfile(payload.new.user_id).then((profile) => {
              setComments((prev) => [
                ...prev,
                {
                  ...(payload.new as TicketComment),
                  user: profile,
                },
              ]);
              // Scroll to bottom for newly added comment
              setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
            });
          }
          if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, userRole, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    const response = await addTicketComment({
      ticket_id: ticketId,
      user_id: userId,
      content: commentText.trim(),
      is_internal: userRole === "developer" ? isInternal : false,
    });
    if (!response.success) {
      toast.error(response.error || "Failed to post comment");
    } else {
      setCommentText("");
      setIsInternal(false);
      // New comment will arrive via realtime
    }
    setIsSubmitting(false);
  };

  // Scroll to bottom when comments update
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [comments, isLoading]);

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <div className="text-muted-foreground text-center py-6">
              No comments yet.
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  isCurrentUser={c.user_id === userId}
                  isInternal={c.is_internal || false}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </>
      )}

      <form onSubmit={handleSubmit} className="mt-2">
        <div className="border rounded-lg overflow-hidden bg-background">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 min-h-[90px] rounded-b-none"
            disabled={isSubmitting}
          />
          <div className="bg-muted px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {userRole === "developer" && (
              <label className="flex items-center text-xs font-medium select-none">
                <input
                  type="checkbox"
                  className="mr-2 accent-amber-500"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span className="text-amber-700">Internal note (hidden from client)</span>
              </label>
            )}
            <Button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};

const CommentItem: React.FC<{
  comment: TicketComment & { user?: CommentUser };
  isCurrentUser: boolean;
  isInternal: boolean;
}> = ({ comment, isCurrentUser, isInternal }) => {
  const { user, content, created_at } = comment;
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] rounded-lg p-4 border 
          ${isCurrentUser
            ? "bg-primary/5 border-primary/20"
            : "bg-muted border-border"}
          ${isInternal ? "border-l-4 border-amber-400" : ""}
        `}
      >
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-8 w-8">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            ) : (
              <AvatarFallback>
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="font-semibold text-xs">
            {user?.name || "Anonymous"}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {created_at ? formatRelativeTime(created_at) : ""}
          </span>
          {isInternal && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              Internal
            </span>
          )}
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">{content}</div>
      </div>
    </div>
  );
};

export default TicketComments;
