
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { createHelpRequest } from '../../../integrations/supabase/helpRequests';
import { toast } from "../../ui/use-toast";

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate();
  const { formData, isSubmitting, setIsSubmitting, resetForm, validateForm } = useHelpRequest();
  const [submissionTimer, setSubmissionTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
    
    // Validate the form
    if (!validateForm()) {
      return; // Stop if validation fails
    }
    
    // Generate a client ID based on authentication status
    // If authenticated, use the actual userId, otherwise create a temporary guest ID
    const clientId = isAuthenticated && userId ? userId : `client-guest-${Date.now()}`;
    
    console.log('Submitting help request with clientId:', clientId, 'isAuthenticated:', isAuthenticated);
    
    setIsSubmitting(true);
    
    // Set a timeout to prevent the page from being stuck in a loading state
    const timer = setTimeout(() => {
      console.log('Submission taking longer than expected, resetting state...');
      setIsSubmitting(false);
      toast({
        title: "Request is taking longer than expected",
        description: "Please try again or refresh the page.",
        variant: "destructive"
      });
    }, 10000); // 10 seconds timeout
    
    setSubmissionTimer(timer);
    
    try {
      // Ensure estimated_duration is a number
      const duration = typeof formData.estimated_duration === 'string' 
        ? parseInt(formData.estimated_duration, 10) 
        : formData.estimated_duration;
      
      // Create base request object - omit ticket_number as it's auto-generated
      const helpRequestBase = {
        title: formData.title || 'Untitled Request',
        description: formData.description || 'No description provided',
        technical_area: formData.technical_area,
        urgency: formData.urgency || 'medium',
        communication_preference: formData.communication_preference,
        estimated_duration: duration,
        budget_range: formData.budget_range,
        code_snippet: formData.code_snippet || '',
        status: 'pending',
        client_id: clientId,
      };
      
      // Use the createHelpRequest utility function
      const result = await createHelpRequest(helpRequestBase);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Help request created successfully:', result);
      
      // Show success message and redirect
      toast({
        title: "Success!",
        description: "Your help request has been submitted successfully.",
        variant: "success"
      });
      
      resetForm();
      
      // Clear the timeout since submission was successful
      if (submissionTimer) {
        clearTimeout(submissionTimer);
        setSubmissionTimer(null);
      }
      
      // Navigate to success page with request ID and data
      navigate('/get-help/success', { 
        state: { 
          requestId: result.data.id,
          ticketData: result.data 
        },
        replace: true // Replace history so back button doesn't take user to the form
      });
      
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error submitting request",
        description: "An unexpected error occurred: " + error.message,
        variant: "destructive"
      });
    } finally {
      // Clear the timeout
      if (submissionTimer) {
        clearTimeout(submissionTimer);
        setSubmissionTimer(null);
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-border/40">
      <h2 className="text-2xl font-semibold mb-6">Request Developer Help</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  );
};

export default FormContainer;
