
import React from 'react';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface NotesSectionProps {
  developerQANotes: string;
  clientFeedback: string;
  onDeveloperNotesChange: (notes: string) => void;
  onClientFeedbackChange: (feedback: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  developerQANotes,
  clientFeedback,
  onDeveloperNotesChange,
  onClientFeedbackChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Developer Notes</Label>
        <Textarea
          value={developerQANotes}
          onChange={(e) => onDeveloperNotesChange(e.target.value)}
          placeholder="Add your developer notes here..."
          className="mt-1"
        />
      </div>
      <div>
        <Label>Client Feedback</Label>
        <Textarea
          value={clientFeedback}
          onChange={(e) => onClientFeedbackChange(e.target.value)}
          placeholder="Add your feedback here..."
          className="mt-1"
        />
      </div>
    </div>
  );
};
