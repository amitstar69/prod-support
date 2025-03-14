
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';

const CodeSnippetSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <div className="space-y-2">
      <label htmlFor="code_snippet" className="block text-sm font-medium">
        Code Snippet (Optional)
      </label>
      <div className="relative">
        <textarea
          id="code_snippet"
          name="code_snippet"
          value={formData.code_snippet || ''}
          onChange={handleInputChange}
          placeholder="Paste relevant code here..."
          rows={8}
          className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 font-mono text-sm transition-colors"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Sharing a code snippet helps developers understand your issue better
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetSection;
