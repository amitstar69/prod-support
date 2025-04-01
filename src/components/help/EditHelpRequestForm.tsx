
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest, technicalAreaOptions, communicationOptions, budgetRangeOptions, urgencyOptions } from '../../types/helpRequest';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';

interface EditHelpRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  helpRequest: HelpRequest | null;
  onRequestUpdated: () => void;
}

const EditHelpRequestForm: React.FC<EditHelpRequestFormProps> = ({
  isOpen,
  onClose,
  helpRequest,
  onRequestUpdated
}) => {
  const [formData, setFormData] = useState<Partial<HelpRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTechnicalAreas, setSelectedTechnicalAreas] = useState<string[]>([]);
  const [selectedCommunicationPreferences, setSelectedCommunicationPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (helpRequest) {
      setFormData({
        title: helpRequest.title,
        description: helpRequest.description,
        budget_range: helpRequest.budget_range,
        estimated_duration: helpRequest.estimated_duration,
        urgency: helpRequest.urgency,
        code_snippet: helpRequest.code_snippet || '',
      });
      setSelectedTechnicalAreas(helpRequest.technical_area || []);
      setSelectedCommunicationPreferences(helpRequest.communication_preference || []);
    }
  }, [helpRequest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleTechnicalArea = (area: string) => {
    setSelectedTechnicalAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleCommunicationPreference = (pref: string) => {
    setSelectedCommunicationPreferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error('Please provide a title for your help request');
      return false;
    }
    
    if (!formData.description?.trim()) {
      toast.error('Please provide a description of your issue');
      return false;
    }
    
    if (selectedTechnicalAreas.length === 0) {
      toast.error('Please select at least one technical area');
      return false;
    }
    
    if (selectedCommunicationPreferences.length === 0) {
      toast.error('Please select at least one communication preference');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!helpRequest?.id || !validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedHelpRequest = {
        ...formData,
        technical_area: selectedTechnicalAreas,
        communication_preference: selectedCommunicationPreferences
      };
      
      const response = await updateHelpRequest(helpRequest.id, updatedHelpRequest);
      
      if (response.success) {
        toast.success('Help request updated successfully');
        onRequestUpdated();
        onClose();
      } else {
        toast.error(`Failed to update help request: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating help request:', error);
      toast.error('An unexpected error occurred while updating your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Help Request</DialogTitle>
          <DialogDescription>
            Update the details of your help request below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Technical Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {technicalAreaOptions.map((area) => (
                <Badge
                  key={area}
                  variant={selectedTechnicalAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTechnicalArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium mb-1">
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency || 'medium'}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Communication Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {communicationOptions.map((pref) => (
                <Badge
                  key={pref}
                  variant={selectedCommunicationPreferences.includes(pref) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCommunicationPreference(pref)}
                >
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="estimated_duration" className="block text-sm font-medium mb-1">
              Estimated Duration (minutes)
            </label>
            <Input
              id="estimated_duration"
              name="estimated_duration"
              type="number"
              min="15"
              step="15"
              value={formData.estimated_duration || 30}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="budget_range" className="block text-sm font-medium mb-1">
              Budget Range
            </label>
            <select
              id="budget_range"
              name="budget_range"
              value={formData.budget_range || budgetRangeOptions[1]}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {budgetRangeOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="code_snippet" className="block text-sm font-medium mb-1">
              Code Snippet (optional)
            </label>
            <Textarea
              id="code_snippet"
              name="code_snippet"
              value={formData.code_snippet || ''}
              onChange={handleInputChange}
              rows={4}
              className="font-mono text-sm w-full"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHelpRequestForm;
