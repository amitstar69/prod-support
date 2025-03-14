
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';

const UrgencyDurationSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <>
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
      
      {/* Estimated Duration */}
      <div>
        <label htmlFor="estimated_duration" className="block text-sm font-medium mb-2">
          Estimated Duration (minutes)
        </label>
        <select
          id="estimated_duration"
          name="estimated_duration"
          value={formData.estimated_duration.toString()}
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
    </>
  );
};

export default UrgencyDurationSection;
