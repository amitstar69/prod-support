
import React from 'react';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';

interface NotesSectionProps {
  developerQANotes: string;
  clientFeedback: string;
  onDeveloperNotesChange: (value: string) => void;
  onClientFeedbackChange: (value: string) => void;
  readOnly?: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  developerQANotes,
  clientFeedback,
  onDeveloperNotesChange,
  onClientFeedbackChange,
  readOnly = false
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="developerQANotes">Developer QA Notes</Label>
        <Textarea
          id="developerQANotes"
          placeholder="Add your QA notes here..."
          value={developerQANotes}
          onChange={(e) => onDeveloperNotesChange(e.target.value)}
          className="resize-none"
          readOnly={readOnly}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="clientFeedback">Client Feedback</Label>
        <Textarea
          id="clientFeedback"
          placeholder="Enter client feedback here..."
          value={clientFeedback}
          onChange={(e) => onClientFeedbackChange(e.target.value)}
          className="resize-none"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};
