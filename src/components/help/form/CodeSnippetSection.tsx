
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

const CodeSnippetSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <div className="space-y-2">
      <Label htmlFor="code_snippet" className="text-base font-medium text-foreground flex items-center">
        Code Snippet 
        <span className="text-muted-foreground font-normal text-sm ml-2">(Optional)</span>
      </Label>
      <Textarea
        id="code_snippet"
        name="code_snippet"
        value={formData.code_snippet || ''}
        onChange={handleInputChange}
        placeholder="Paste relevant code here..."
        rows={8}
        className="w-full font-mono text-sm text-foreground bg-background"
        aria-label="Optional code snippet"
      />
      <p className="text-sm text-muted-foreground mt-2">
        Sharing a code snippet helps developers understand your issue better
      </p>
    </div>
  );
};

export default CodeSnippetSection;
