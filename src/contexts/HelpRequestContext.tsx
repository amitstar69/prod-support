
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HelpRequest, HelpRequestStatus, technicalAreaOptions, communicationOptions, budgetRangeOptions } from '../types/helpRequest';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

type HelpRequestContextType = {
  formData: Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>;
  isSubmitting: boolean;
  setFormData: React.Dispatch<React.SetStateAction<Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectChange: (name: string, value: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  submitForm: (clientId: string) => Promise<{success: boolean, data?: any, error?: string}>;
};

const defaultFormData: Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  description: '',
  technical_area: [],
  urgency: 'medium',
  communication_preference: [],
  estimated_duration: 30,
  budget_range: budgetRangeOptions[1],
  code_snippet: '',
  status: 'pending' as HelpRequestStatus
};

export const HelpRequestContext = createContext<HelpRequestContextType | undefined>(undefined);

export const HelpRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'estimated_duration') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [name]: currentValues.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [name]: [...currentValues, value]
          };
        }
      }
      
      return prev;
    });
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Please provide a title for your help request");
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error("Please provide a description of your issue");
      return false;
    }
    
    if (formData.technical_area.length === 0) {
      toast.error("Please select at least one technical area");
      return false;
    }
    
    if (formData.communication_preference.length === 0) {
      toast.error("Please select at least one communication preference");
      return false;
    }
    
    return true;
  };
  
  const submitForm = async (clientId: string) => {
    console.log('[HelpRequestContext] Submitting form with client ID:', clientId);
    try {
      // Ensure duration is a number
      const duration = typeof formData.estimated_duration === 'string' 
        ? parseInt(formData.estimated_duration, 10) 
        : formData.estimated_duration;
        
      // Create complete request object
      const helpRequest = {
        ...formData,
        estimated_duration: duration,
        client_id: clientId,
      };
      
      // Insert the help request into Supabase
      const { data, error } = await supabase
        .from('help_requests')
        .insert([helpRequest])
        .select()
        .single();
      
      if (error) {
        console.error('[HelpRequestContext] Supabase error submitting request:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      console.log('[HelpRequestContext] Help request submitted successfully:', data);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('[HelpRequestContext] Exception submitting help request:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  };

  return (
    <HelpRequestContext.Provider 
      value={{ 
        formData, 
        isSubmitting, 
        setFormData, 
        setIsSubmitting, 
        handleInputChange, 
        handleMultiSelectChange,
        resetForm,
        validateForm,
        submitForm
      }}
    >
      {children}
    </HelpRequestContext.Provider>
  );
};

export const useHelpRequest = () => {
  const context = useContext(HelpRequestContext);
  if (context === undefined) {
    throw new Error('useHelpRequest must be used within a HelpRequestProvider');
  }
  return context;
};
