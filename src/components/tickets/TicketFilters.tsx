
import React from 'react';
import { technicalAreaOptions } from '../../types/helpRequest';

interface TicketFiltersProps {
  filters: {
    status: string;
    technicalArea: string;
    urgency: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({ filters, onFilterChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'matching', label: 'Matching' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const urgencyOptions = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-border/40 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="area-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Technical Area
          </label>
          <select
            id="area-filter"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filters.technicalArea}
            onChange={(e) => onFilterChange('technicalArea', e.target.value)}
          >
            <option value="all">All Technical Areas</option>
            {technicalAreaOptions.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="urgency-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Urgency
          </label>
          <select
            id="urgency-filter"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filters.urgency}
            onChange={(e) => onFilterChange('urgency', e.target.value)}
          >
            {urgencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
