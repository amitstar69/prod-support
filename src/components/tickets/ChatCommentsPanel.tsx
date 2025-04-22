
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type ChatMessage = {
  id: string;
  help_request_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

interface ChatCommentsPanelProps {
  ticketId: string;
  userId: string;
}

const ChatCommentsPanel: React.FC<ChatCommentsPanelProps> = ({ ticketId, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("help_request_id", ticketId)
      .order("created_at", { ascending: true })
      .limit(20);
    if (!error && data) setMessages(data as ChatMessage[]);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`chat-messages-${ticketId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `help_request_id=eq.${ticketId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setMessages(msgs => [...msgs, payload.new as ChatMessage]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  // Scroll to bottom on message update
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages]);

  // Post comment
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    await supabase.from("chat_messages").insert({
      help_request_id: ticketId,
      sender_id: userId,
      receiver_id: null, // Use null/empty, or enhance if you want to support message routing
      message: input.trim(),
      is_read: false,
    });
    setInput("");
    setLoading(false);
    // Message will arrive via realtime
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-60 overflow-auto mb-4">
          {messages.length === 0 ? (
            <div className="text-muted-foreground text-center py-6">No comments yet.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="flex flex-col">
                <span className="text-xs text-gray-500">
                  {msg.sender_id === userId ? "You" : msg.sender_id}
                  {" • "}
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                <div className={`rounded-md px-3 py-2 text-sm ${msg.sender_id === userId ? "bg-primary/10" : "bg-muted"}`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <Textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
            className="resize-none"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatCommentsPanel;
