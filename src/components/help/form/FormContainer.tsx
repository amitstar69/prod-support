import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { createHelpRequest } from '../../../integrations/supabase/helpRequests';
import { toast } from "sonner";
import StepButtons from './StepButtons';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate();
  const { formData, isSubmitting, currentStep, setIsSubmitting, resetForm, validateForm } = useHelpRequest();
  const [submissionTimer, setSubmissionTimer] = useState<NodeJS.Timeout | null>(null);
  
  const totalSteps = 2; // Total number of steps in our form
  
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
      toast.error("Request is taking longer than expected. Please try again or refresh the page.");
    }, 10000); // 10 seconds timeout
    
    setSubmissionTimer(timer);
    
    try {
      // Ensure estimated_duration is a number
      const duration = typeof formData.estimated_duration === 'string' 
        ? parseInt(formData.estimated_duration, 10) 
        : formData.estimated_duration;
      
      // Create base request object with all our fields
      const helpRequestBase = {
        title: formData.title || 'Untitled Request',
        description: formData.description || 'No description provided',
        technical_area: formData.technical_area,
        urgency: formData.urgency || 'flexible',
        communication_preference: formData.communication_preference,
        estimated_duration: duration,
        budget_range: formData.budget_range,
        code_snippet: formData.code_snippet || '',
        status: 'pending',
        client_id: clientId,
        nda_required: formData.nda_required || false,
        preferred_developer_location: formData.preferred_developer_location || 'Global'
      };
      
      // Use the createHelpRequest utility function
      const result = await createHelpRequest(helpRequestBase);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Help request created successfully:', result);
      
      // Show success message and redirect
      toast.success("Your help request has been submitted successfully.");
      
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
      toast.error("An unexpected error occurred: " + error.message);
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
        {/* Only show the current step */}
        {React.Children.toArray(children)[currentStep - 1]}
        
        <StepButtons totalSteps={totalSteps} onSubmit={handleSubmit} />
      </form>
    </div>
  );
};

export default FormContainer;
