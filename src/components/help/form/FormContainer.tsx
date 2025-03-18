
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { createHelpRequest } from '../../../integrations/supabase/helpRequests';
import { toast } from "sonner";
import StepButtons from './StepButtons';
import { Progress } from '../../../components/ui/progress';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate();
  const { formData, isSubmitting, currentStep, setIsSubmitting, resetForm, validateForm } = useHelpRequest();
  const [submissionProgress, setSubmissionProgress] = useState(0);
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
    setSubmissionProgress(10); // Start progress
    
    // Set up a progress simulation for visual feedback
    // This gives users a sense that something is happening
    const progressInterval = setInterval(() => {
      setSubmissionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 700);
    
    // Set a timeout to prevent the page from being stuck in a loading state
    // We'll extend this to 30 seconds to account for potential network delays
    const timer = setTimeout(() => {
      console.log('Submission taking longer than expected, resetting state...');
      setIsSubmitting(false);
      setSubmissionProgress(0);
      clearInterval(progressInterval);
      toast.error("Request is taking longer than expected. Please try again or refresh the page.");
    }, 30000); // 30 seconds timeout
    
    setSubmissionTimer(timer);
    
    try {
      // Update progress to indicate we're processing
      setSubmissionProgress(30);
      
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
      
      setSubmissionProgress(60); // Update progress
      
      // Use the createHelpRequest utility function
      const result = await createHelpRequest(helpRequestBase);
      
      setSubmissionProgress(90); // Almost done
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Help request created successfully:', result);
      
      setSubmissionProgress(100); // Complete
      
      // Show success message and redirect
      toast.success("Your help request has been submitted successfully.");
      
      resetForm();
      
      // Clear the timeout and interval since submission was successful
      if (submissionTimer) {
        clearTimeout(submissionTimer);
        setSubmissionTimer(null);
      }
      clearInterval(progressInterval);
      
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
      clearInterval(progressInterval);
      
      // Provide more specific error messages based on the error
      if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error("Network error: Please check your internet connection and try again");
      } else if (error.message.includes('timeout')) {
        toast.error("Request timed out: The server is taking too long to respond");
      } else {
        toast.error("An error occurred: " + error.message);
      }
      
      // Reset the progress
      setSubmissionProgress(0);
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
        
        {/* Show progress bar when submitting */}
        {isSubmitting && (
          <div className="space-y-2 py-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Submitting your request...</span>
              <span className="text-sm font-medium">{submissionProgress}%</span>
            </div>
            <Progress value={submissionProgress} className="h-2" />
          </div>
        )}
        
        <StepButtons totalSteps={totalSteps} onSubmit={handleSubmit} />
      </form>
    </div>
  );
};

export default FormContainer;
