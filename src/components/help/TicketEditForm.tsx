
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { HelpRequest } from '../../types/helpRequest';

interface TicketEditFormProps {
  ticket: HelpRequest;
  onSave: (updatedTicket: Partial<HelpRequest>) => Promise<void>;
  onCancel: () => void;
}

const TicketEditForm: React.FC<TicketEditFormProps> = ({ 
  ticket, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState(ticket.title || '');
  const [description, setDescription] = useState(ticket.description || '');
  const [technicalAreas, setTechnicalAreas] = useState<string[]>(
    ticket.technical_area || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setIsSaving(true);
      
      await onSave({
        title,
        description,
        technical_area: technicalAreas
      });
    } catch (err) {
      console.error('Error saving ticket:', err);
      toast.error('Failed to update ticket');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTechnicalAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Split by commas and trim each value
    const areas = value.split(',').map(area => area.trim()).filter(Boolean);
    setTechnicalAreas(areas);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Ticket</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the issue"
              className={`min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technicalAreas">Technical Areas (comma-separated)</Label>
            <Input 
              id="technicalAreas"
              value={technicalAreas.join(', ')}
              onChange={handleTechnicalAreaChange}
              placeholder="e.g. React, TypeScript, Database"
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            Note: Editing this ticket will create an entry in the ticket history log.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketEditForm;
