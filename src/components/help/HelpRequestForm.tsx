
import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';
import { HelpRequestProvider, useHelpRequest } from '../../contexts/HelpRequestContext';

// Import form sections
import TitleDescriptionSection from './form/TitleDescriptionSection';
import TechnicalAreaSection from './form/TechnicalAreaSection';
import UrgencyDurationSection from './form/UrgencyDurationSection';
import CommunicationSection from './form/CommunicationSection';
import BudgetSection from './form/BudgetSection';
import CodeSnippetSection from './form/CodeSnippetSection';
import SubmitButton from './form/SubmitButton';

const HelpRequestFormContent: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { 
    formData, 
    isSubmitting, 
    setIsSubmitting, 
    validateForm 
  } = useHelpRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('You must be logged in to submit a help request');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting help request with userId:', userId);
      
      // Convert estimated_duration to a number if it's a string
      const duration = typeof formData.estimated_duration === 'string' 
        ? parseInt(formData.estimated_duration, 10) 
        : formData.estimated_duration;
      
      const helpRequest: HelpRequest = {
        ...formData,
        estimated_duration: duration,
        client_id: userId,
        status: 'pending'
      };
      
      console.log('Help request data:', helpRequest);
      
      const { data, error } = await supabase
        .from('help_requests')
        .insert(helpRequest)
        .select()
        .single();
      
      if (error) {
        console.error('Error submitting help request:', error);
        toast.error('Failed to submit help request: ' + error.message);
        setIsSubmitting(false);
        return;
      }
      
      toast.success('Help request submitted successfully!');
      console.log('Help request submitted:', data);
      
      // Redirect to success page with the request ID
      navigate('/get-help/success', { state: { requestId: data.id } });
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
        <TitleDescriptionSection />
        <TechnicalAreaSection />
        <UrgencyDurationSection />
        <CommunicationSection />
        <BudgetSection />
        <CodeSnippetSection />
        <SubmitButton />
      </form>
    </div>
  );
};

const HelpRequestForm: React.FC = () => {
  return (
    <HelpRequestProvider>
      <HelpRequestFormContent />
    </HelpRequestProvider>
  );
};

export default HelpRequestForm;
