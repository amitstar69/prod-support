
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest, technicalAreaOptions, communicationOptions, budgetRangeOptions } from '../../types/helpRequest';
import { Loader2, Send, Check } from 'lucide-react';

const HelpRequestForm: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<HelpRequest, 'client_id'>>({
    title: '',
    description: '',
    technical_area: [],
    urgency: 'medium',
    communication_preference: [],
    estimated_duration: 30,
    budget_range: budgetRangeOptions[1],
    code_snippet: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your help request');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please describe your issue');
      return false;
    }
    
    if (formData.technical_area.length === 0) {
      toast.error('Please select at least one technical area');
      return false;
    }
    
    if (formData.communication_preference.length === 0) {
      toast.error('Please select at least one communication preference');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('You must be logged in to submit a help request');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const helpRequest: HelpRequest = {
        ...formData,
        client_id: userId
      };
      
      const { data, error } = await supabase
        .from('help_requests')
        .insert(helpRequest)
        .select()
        .single();
      
      if (error) {
        console.error('Error submitting help request:', error);
        toast.error('Failed to submit help request');
        setIsSubmitting(false);
        return;
      }
      
      toast.success('Help request submitted successfully!');
      console.log('Help request submitted:', data);
      
      // Redirect to a confirmation or tracking page
      navigate('/get-help/success', { state: { requestId: data.id } });
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-border/40">
      <h2 className="text-2xl font-semibold mb-6">Request Developer Help</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Issue Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Need help with React component optimization"
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            maxLength={100}
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Describe Your Issue
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please provide details about what you're trying to accomplish and what issues you're facing..."
            rows={5}
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        
        {/* Technical Area */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Technical Area (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {technicalAreaOptions.map((area) => (
              <div
                key={area}
                onClick={() => handleMultiSelectChange('technical_area', area)}
                className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                  formData.technical_area.includes(area)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {area}
              </div>
            ))}
          </div>
        </div>
        
        {/* Urgency */}
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium mb-2">
            Urgency
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="low">Low - I can wait a few days</option>
            <option value="medium">Medium - I'd like help within 24 hours</option>
            <option value="high">High - I need help ASAP</option>
          </select>
        </div>
        
        {/* Communication Preference */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Communication Methods
          </label>
          <div className="flex flex-wrap gap-2">
            {communicationOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleMultiSelectChange('communication_preference', option)}
                className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                  formData.communication_preference.includes(option)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
        
        {/* Estimated Duration */}
        <div>
          <label htmlFor="estimated_duration" className="block text-sm font-medium mb-2">
            Estimated Duration (minutes)
          </label>
          <select
            id="estimated_duration"
            name="estimated_duration"
            value={formData.estimated_duration}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        
        {/* Budget Range */}
        <div>
          <label htmlFor="budget_range" className="block text-sm font-medium mb-2">
            Budget Range
          </label>
          <select
            id="budget_range"
            name="budget_range"
            value={formData.budget_range}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {budgetRangeOptions.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
        
        {/* Code Snippet */}
        <div>
          <label htmlFor="code_snippet" className="block text-sm font-medium mb-2">
            Code Snippet (Optional)
          </label>
          <textarea
            id="code_snippet"
            name="code_snippet"
            value={formData.code_snippet}
            onChange={handleInputChange}
            placeholder="Paste relevant code here..."
            rows={8}
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 font-mono text-sm transition-colors"
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Help Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default HelpRequestForm;
