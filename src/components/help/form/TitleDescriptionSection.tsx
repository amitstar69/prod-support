
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';

const TitleDescriptionSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <>
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
    </>
  );
};

export default TitleDescriptionSection;
