
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Label } from '../../ui/label';

const CodeSnippetSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <div className="space-y-2">
      <Label htmlFor="code_snippet" className="text-base font-medium text-slate-800">
        Code Snippet <span className="text-slate-600 font-normal text-sm">(Optional)</span>
      </Label>
      <div className="relative">
        <textarea
          id="code_snippet"
          name="code_snippet"
          value={formData.code_snippet || ''}
          onChange={handleInputChange}
          placeholder="Paste relevant code here..."
          rows={8}
          className="w-full px-4 py-3 border border-slate-300 rounded-md bg-slate-50 font-mono text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          aria-label="Optional code snippet"
        />
        <div className="text-sm text-slate-600 mt-2">
          Sharing a code snippet helps developers understand your issue better
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetSection;
