
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { isApiSuccess, isApiError } from '../../types/api';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/auth';

// Define valid status transitions
const validStatusTransitions = {
  developer: {
    'in-progress': ['developer-qa'],
    'developer-qa': ['client-review'],
    'client-approved': ['completed']
  },
  client: {
    'client-review': ['client-approved', 'in-progress'],
    'completed': ['in-progress']
  }
};

// Helper validation functions
const isValidStatus = (status: string, userType: string): boolean => {
  const allowedStatuses = userType === 'developer' 
    ? Object.keys(validStatusTransitions.developer).concat(
        ...Object.values(validStatusTransitions.developer)
      )
    : Object.keys(validStatusTransitions.client).concat(
        ...Object.values(validStatusTransitions.client)
      );
      
  return allowedStatuses.includes(status);
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
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();
  
  // Validate request ID
  const validateRequestId = (): boolean => {
    if (!requestId || typeof requestId !== 'string') {
      toast.error("Invalid request ID");
      return false;
    }
    return true;
  };

  const updateStatus = async (newStatus: string) => {
    // Reset error state
    setError(null);
    
    // Validate inputs
    if (!validateRequestId()) return;
    
    if (!isValidStatus(newStatus, userType || 'client')) {
      toast.error("Invalid status value for your user type");
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log(`Attempting to update request ${requestId} to status: ${newStatus}`);
      
      const response = await updateHelpRequest(
        requestId, 
        { status: newStatus }, 
        userType || 'client'
      );
      
      if (isApiSuccess(response)) {
        onUpdate?.(response.data);
        toast.success("Status updated successfully");
      } else if (isApiError(response)) {
        setError(response.error || "Failed to update status");
        toast.error(response.error || "Failed to update status");
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating status:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotes = async (notes: { 
    developer_qa_notes?: string;
    client_feedback?: string;
  }) => {
    // Reset error state
    setError(null);
    
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
      const response = await updateHelpRequest(
        requestId, 
        sanitizedNotes, 
        userType || 'client'
      );
      
      if (isApiSuccess(response)) {
        onUpdate?.(response.data);
        toast.success("Notes saved successfully");
      } else if (isApiError(response)) {
        setError(response.error || "Failed to save notes");
        toast.error(response.error || "Failed to save notes");
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    error,
    updateStatus,
    saveNotes,
    validTransitions: userType === 'developer' 
      ? validStatusTransitions.developer 
      : validStatusTransitions.client
  };
};
