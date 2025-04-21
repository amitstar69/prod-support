
import { useState, useEffect } from 'react';
import { STATUSES, getStatusLabel, getAllowedStatusTransitions } from '../utils/helpRequestStatusUtils';

export interface ApplicationStatus {
  id: string;
  label: string;
  value: string;
}

interface UseApplicationStatusesResult {
  statuses: ApplicationStatus[];
  isLoading: boolean;
  error: string | null;
}

export const useApplicationStatuses = (userType: 'client' | 'developer' = 'developer'): UseApplicationStatusesResult => {
  const [statuses, setStatuses] = useState<ApplicationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Create status list from the predefined statuses in helpRequestStatusUtils.ts
      const statusList = Object.entries(STATUSES).map(([key, value]) => ({
        id: value,
        label: getStatusLabel(value),
        value: value
      }));

      // Sort the statuses in a logical order for workflow progression
      // These are default values - will be filtered by current status in actual implementation
      const developerStatuses = [
        STATUSES.REQUIREMENTS_REVIEW,
        STATUSES.NEED_MORE_INFO,
        STATUSES.IN_PROGRESS,
        STATUSES.READY_FOR_CLIENT_QA,
        STATUSES.READY_FOR_FINAL_ACTION,
        STATUSES.RESOLVED,
      ];
      
      const clientStatuses = [
        STATUSES.APPROVED,
        STATUSES.QA_PASS,
        STATUSES.QA_FAIL,
        STATUSES.RESOLVED,
        STATUSES.CANCELLED_BY_CLIENT,
      ];

      // Choose appropriate statuses based on user type
      const orderedStatuses = userType === 'client' ? clientStatuses : developerStatuses;

      // Filter and sort the status list
      const formattedStatuses = statusList
        .filter(status => orderedStatuses.includes(status.value))
        .sort((a, b) => {
          return orderedStatuses.indexOf(a.value) - orderedStatuses.indexOf(b.value);
        });

      console.log(`Prepared ${formattedStatuses.length} statuses for ${userType}`, formattedStatuses);
      setStatuses(formattedStatuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load status options');
      console.error('Error preparing application statuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userType]);

  return { statuses, isLoading, error };
};
