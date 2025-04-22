import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { TicketStatus, updateTicketStatus } from '../../utils/ticketStatusUtils';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/auth';

export const useHelpRequestActions = (
  ticketId: string,
  onUpdate?: (ticket: HelpRequest) => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { userType } = useAuth();

  const updateStatus = async (
    newStatus: TicketStatus,
    notes?: string
  ) => {
    if (!userType) return null;
    
    try {
      setIsSaving(true);
      const updatedTicket = await updateTicketStatus(
        ticketId,
        newStatus,
        userType,
        notes
      );
      onUpdate?.(updatedTicket);
      return updatedTicket;
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotes = async (notes: {
    developer_qa_notes?: string;
    client_feedback?: string;
  }) => {
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('help_requests')
        .update({
          ...notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to save notes: ${error.message}`);
      }
      
      if (data) {
        onUpdate?.(data as HelpRequest);
        return data as HelpRequest;
      }
      
      return null;
    } catch (err) {
      console.error('Failed to save notes:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { updateStatus, saveNotes, isSaving };
};
