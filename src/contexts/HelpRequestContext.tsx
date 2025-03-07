
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HelpRequest, technicalAreaOptions, communicationOptions, budgetRangeOptions } from '../types/helpRequest';

type HelpRequestContextType = {
  formData: Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>;
  isSubmitting: boolean;
  setFormData: React.Dispatch<React.SetStateAction<Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectChange: (name: string, value: string) => void;
  validateForm: () => boolean;
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
  status: 'pending'
};

export const HelpRequestContext = createContext<HelpRequestContextType | undefined>(undefined);

export const HelpRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for estimated_duration to convert to number
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

  const validateForm = (): boolean => {
    return !!(
      formData.title.trim() && 
      formData.description.trim() && 
      formData.technical_area.length > 0 && 
      formData.communication_preference.length > 0
    );
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
        validateForm 
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
