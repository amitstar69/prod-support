import React, { useState } from 'react';
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
    resetForm
  } = useHelpRequest();

  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('You must be logged in to submit a help request');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors([]);
    
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
        status: 'requirements',
      };
      
      // Check if using local storage authentication
      const isLocalAuth = userId.startsWith('client-');
      
      let requestId: string;
      
      if (isLocalAuth) {
        // For local storage authentication, store in localStorage
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const newRequest = {
          ...helpRequestBase,
          id: `help-${Date.now()}`,
          client_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localHelpRequests.push(newRequest);
        localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
        console.log('Help request stored locally:', newRequest);
        requestId = newRequest.id;
        
        // Show success message and redirect
        toast.success('Help request submitted successfully!');
        resetForm();
        navigate('/get-help/success', { state: { requestId } });
      } else {
        // For Supabase authentication, we need a valid UUID
        if (!isValidUUID(userId)) {
          console.error('Invalid UUID format for Supabase:', userId);
          toast.error('Authentication error: Invalid user ID format');
          setIsSubmitting(false);
          return;
        }
        
        // For Supabase authentication, store in database
        const helpRequest = {
          ...helpRequestBase,
          client_id: userId,
        };
        
        console.log('Help request data for Supabase:', helpRequest);
        
        // Get current session to verify authentication
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session when submitting:', sessionData);
        
        try {
          // Check if we have an active session
          if (!sessionData.session) {
            console.error('No active Supabase session found');
            throw new Error('Authentication required');
          }
          
          const { data, error } = await supabase
            .from('help_requests')
            .insert(helpRequest)
            .select()
            .single();
          
          if (error) {
            console.error('Error submitting help request to Supabase:', error);
            
            // If failed due to Supabase, fall back to localStorage
            toast.warning('Could not save to database, storing locally instead');
            
            const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
            const newRequest = {
              ...helpRequestBase,
              id: `help-${Date.now()}`,
              client_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            localHelpRequests.push(newRequest);
            localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
            console.log('Help request stored locally as fallback:', newRequest);
            requestId = newRequest.id;
            
            // Show success message and redirect
            toast.success('Help request submitted successfully (stored locally)!');
            resetForm();
            navigate('/get-help/success', { state: { requestId } });
          } else {
            console.log('Help request submitted to Supabase successfully:', data);
            requestId = data.id;
            
            // Show success message and redirect
            toast.success('Help request submitted to database successfully!');
            resetForm();
            navigate('/get-help/success', { state: { requestId } });
          }
        } catch (supabaseError: any) {
          console.error('Exception during Supabase insert:', supabaseError);
          
          // Fall back to localStorage
          toast.warning('Could not save to database, storing locally instead');
          
          const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
          const newRequest = {
            ...helpRequestBase,
            id: `help-${Date.now()}`,
            client_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          localHelpRequests.push(newRequest);
          localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
          console.log('Help request stored locally as fallback:', newRequest);
          requestId = newRequest.id;
          
          // Show success message and redirect
          toast.success('Help request submitted successfully (stored locally)!');
          resetForm();
          navigate('/get-help/success', { state: { requestId } });
        }
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred: ' + error.message);
      setFormErrors([error.message]);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-border/40">
      <h2 className="text-2xl font-semibold mb-6">Request Developer Help</h2>
      
      {formErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <h3 className="font-medium">Please correct the following errors:</h3>
          <ul className="list-disc list-inside mt-2">
            {formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
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
