
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { toast } from 'sonner';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate();
  const { formData, isSubmitting, setIsSubmitting, validateForm, submitForm } = useHelpRequest();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
    
    // Validate the form first
    if (!validateForm()) {
      return;
    }
    
    // Generate a client ID based on authentication status
    // If authenticated, use the actual userId, otherwise create a temporary guest ID
    const clientId = isAuthenticated && userId ? userId : `guest-${Date.now()}`;
    
    console.log('[FormContainer] Submitting help request, isAuthenticated:', isAuthenticated, 'clientId:', clientId);
    
    setIsSubmitting(true);
    toast.loading('Submitting your request...');
    
    try {
      const result = await submitForm(clientId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.dismiss();
      toast.success('Help request submitted successfully!');
      
      // Navigate to success page
      navigate('/get-help/success', { state: { requestId: result.data.id } });
    } catch (error: any) {
      toast.dismiss();
      console.error('[FormContainer] Error submitting form:', error);
      toast.error('Failed to submit request: ' + (error.message || 'Unknown error'));
    } finally {
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
