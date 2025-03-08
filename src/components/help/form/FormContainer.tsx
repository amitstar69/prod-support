
import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { createHelpRequest, isValidUUID } from '../../../integrations/supabase/helpRequests';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { formData, isSubmitting, setIsSubmitting, resetForm } = useHelpRequest();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('You must be logged in to submit a help request');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting help request with userId:', userId);
      
      // Ensure estimated_duration is a number
      const duration = typeof formData.estimated_duration === 'string' 
        ? parseInt(formData.estimated_duration, 10) 
        : formData.estimated_duration;
      
      // Create base request object
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
        client_id: userId,
      };
      
      // Use the createHelpRequest utility function
      const result = await createHelpRequest(helpRequestBase);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Help request created successfully:', result);
      
      // Show success message and redirect
      toast.success('Help request submitted successfully!');
      resetForm();
      navigate('/get-help/success', { state: { requestId: result.data.id } });
      
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred: ' + error.message);
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
