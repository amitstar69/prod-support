
import { supabase } from "./client";
import type { TicketComment } from "../../types/helpRequest";

// Fetch comments for a ticket
export const getTicketComments = async (ticketId: string): Promise<{ success: boolean; data?: TicketComment[]; error?: string }> => {
  const { data, error } = await supabase
    .from("ticket_comments")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TicketComment[] };
};

// Add a new comment to a ticket
export const addTicketComment = async ({
  ticket_id,
  user_id,
  content,
  is_internal = false,
}: {
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal?: boolean;
}): Promise<{ success: boolean; data?: TicketComment; error?: string }> => {
  const { data, error } = await supabase
    .from("ticket_comments")
    .insert([{ ticket_id, user_id, content, is_internal }])
    .select()
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TicketComment };
};
