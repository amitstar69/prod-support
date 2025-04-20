
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { isApiSuccess, isApiError } from '../../types/api';
import { toast } from 'sonner';

// Helper validation functions
const isValidStatus = (status: string): boolean => {
  const validStatuses = [
    'pending', 'accepted', 'in_progress', 
    'reviewing', 'resolved', 'cancelled'
  ];
  return validStatuses.includes(status);
};

const isValidNotes = (notes: string | undefined): boolean => {
  if (notes === undefined) return true;
  return notes.length <= 5000; // Max 5000 characters
};

const sanitizeText = (text: string | undefined): string | undefined => {
  if (text === undefined) return undefined;
  // Basic sanitization - strip HTML and limit length
  return text
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .trim()
    .substring(0, 5000); // Enforce max length
};

export const useHelpRequestActions = (
  requestId: string,
  onUpdate?: (updatedRequest: HelpRequest) => void
) => {
  const [isSaving, setIsSaving] = useState(false);

  // Validate request ID
  const validateRequestId = (): boolean => {
    if (!requestId || typeof requestId !== 'string') {
      toast.error("Invalid request ID");
      return false;
    }
    return true;
  };

  const updateStatus = async (newStatus: string) => {
    // Validate inputs
    if (!validateRequestId()) return;
    
    if (!isValidStatus(newStatus)) {
      toast.error("Invalid status value");
      return;
    }
    
    const response = await updateHelpRequest(requestId, { status: newStatus });
    
    if (isApiSuccess(response)) {
      onUpdate?.(response.data);
      toast.success("Status updated successfully");
    } else if (isApiError(response)) {
      toast.error(response.error || "Failed to update status");
    }
  };

  const saveNotes = async (notes: { 
    developer_qa_notes?: string;
    client_feedback?: string;
  }) => {
    // Validate inputs
    if (!validateRequestId()) return;
    
    if (!isValidNotes(notes.developer_qa_notes) || !isValidNotes(notes.client_feedback)) {
      toast.error("Notes exceed maximum allowed length");
      return;
    }
    
    // Sanitize input
    const sanitizedNotes = {
      developer_qa_notes: sanitizeText(notes.developer_qa_notes),
      client_feedback: sanitizeText(notes.client_feedback)
    };
    
    setIsSaving(true);
    try {
      const response = await updateHelpRequest(requestId, sanitizedNotes);
      
      if (isApiSuccess(response)) {
        onUpdate?.(response.data);
        toast.success("Notes saved successfully");
      } else if (isApiError(response)) {
        toast.error(response.error || "Failed to save notes");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    updateStatus,
    saveNotes
  };
};
