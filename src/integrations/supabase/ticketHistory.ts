
import { supabase } from "./client";
import type { TicketHistoryEntry } from "../../types/helpRequest";

// Fetch history entries for a ticket
export const getTicketHistory = async (ticketId: string): Promise<{ success: boolean; data?: TicketHistoryEntry[]; error?: string }> => {
  const { data, error } = await supabase
    .from("ticket_history")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TicketHistoryEntry[] };
};

// Add a new history entry to a ticket
export const addTicketHistoryEntry = async ({
  ticket_id,
  user_id,
  action_type,
  previous_value,
  new_value,
}: {
  ticket_id: string;
  user_id: string;
  action_type: string;
  previous_value?: string | null;
  new_value?: string | null;
}): Promise<{ success: boolean; data?: TicketHistoryEntry; error?: string }> => {
  const { data, error } = await supabase
    .from("ticket_history")
    .insert([{ ticket_id, user_id, action_type, previous_value, new_value }])
    .select()
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TicketHistoryEntry };
};
