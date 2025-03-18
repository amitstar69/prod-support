
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
    const clientId = isAuthenticated && userId ? userId : `client-guest-${Date.now()}`;
    
    console.log('Submitting help request with clientId:', clientId, 'isAuthenticated:', isAuthenticated);
    console.log('Form data being submitted:', formData);
    
    setIsSubmitting(true);
    setSubmissionProgress(10); // Start progress
    
    // Set up a more realistic progress simulation
    const progressInterval = setInterval(() => {
      setSubmissionProgress(prev => {
        // Move progress more slowly between 60-90%
        if (prev >= 60 && prev < 90) {
          return prev + 2; // Slower progress in the critical range
        } else if (prev < 60) {
          return prev + 10;
        }
        return prev; // Don't auto-increment past 90%
      });
    }, 800); // Slightly slower update frequency
    
    // Extend timeout to 45 seconds
    const timer = setTimeout(() => {
      console.log('Submission taking longer than expected, resetting state...');
      setIsSubmitting(false);
      setSubmissionProgress(0);
      clearInterval(progressInterval);
      toast.error("Request is taking longer than expected. Please try again or refresh the page.");
    }, 45000); // 45 seconds timeout - more generous
    
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
        urgency: formData.urgency || 'medium', // Use medium as fallback for urgency
        communication_preference: formData.communication_preference,
        estimated_duration: duration,
        budget_range: formData.budget_range,
        code_snippet: formData.code_snippet || '',
        status: 'pending',
        client_id: clientId,
        nda_required: formData.nda_required || false,
        preferred_developer_location: formData.preferred_developer_location || 'Global'
      };
      
      console.log('Prepared help request object:', helpRequestBase);
      
      // Add debounce to avoid race conditions or rapid state changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setSubmissionProgress(60); // Update progress
      
      // Use the createHelpRequest utility function with a timeout
      const result = await Promise.race([
        createHelpRequest(helpRequestBase),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]) as any;
      
      // Ensure we have a valid result before proceeding
      if (!result) {
        throw new Error('No response received from server');
      }
      
      setSubmissionProgress(90); // Almost done
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Help request created successfully:', result);
      
      // Small delay to ensure UI has time to update before redirect
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      if (error.message.includes('urgency_check')) {
        toast.error("Invalid urgency value. Please select a valid urgency level.");
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error("Network error: Please check your internet connection and try again");
      } else if (error.message.includes('timeout')) {
        toast.error("Request timed out: The server is taking too long to respond. Please try again later.");
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
              <span className="text-sm text-muted-foreground">
                {submissionProgress < 60 ? "Preparing submission..." : 
                 submissionProgress < 90 ? "Processing your request..." : 
                 "Finalizing submission..."}
              </span>
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
