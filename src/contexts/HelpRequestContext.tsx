
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HelpRequest, technicalAreaOptions, communicationOptions, budgetRangeOptions } from '../types/helpRequest';
import { toast } from 'sonner';

type HelpRequestContextType = {
  formData: Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>;
  isSubmitting: boolean;
  currentStep: number;
  setFormData: React.Dispatch<React.SetStateAction<Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  resetForm: () => void;
  validateStep: (step: number) => boolean;
  validateForm: () => boolean;
  nextStep: () => void;
  prevStep: () => void;
};

const defaultFormData: Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  description: '',
  technical_area: [],
  urgency: 'flexible',
  communication_preference: [],
  estimated_duration: 30,
  budget_range: budgetRangeOptions[1],
  code_snippet: '',
  status: 'pending',
  nda_required: false,
  preferred_developer_location: 'Global'
};

export const HelpRequestContext = createContext<HelpRequestContextType | undefined>(undefined);

export const HelpRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Omit<HelpRequest, 'client_id' | 'id' | 'created_at' | 'updated_at'>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsSubmitting(false);
    setCurrentStep(1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Validate Step 1: Basic Info
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
        
        return true;
        
      case 2:
        // Validate Step 2: Additional Info
        if (formData.communication_preference.length === 0) {
          toast.error("Please select at least one communication preference");
          return false;
        }
        
        return true;
        
      default:
        return true;
    }
  };

  const validateForm = (): boolean => {
    // First validate current step
    if (!validateStep(currentStep)) {
      return false;
    }
    
    // Then validate all steps
    return validateStep(1) && validateStep(2);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <HelpRequestContext.Provider 
      value={{ 
        formData, 
        isSubmitting, 
        currentStep,
        setFormData, 
        setIsSubmitting, 
        setCurrentStep,
        handleInputChange, 
        handleMultiSelectChange,
        handleSwitchChange,
        resetForm,
        validateStep,
        validateForm,
        nextStep,
        prevStep
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
