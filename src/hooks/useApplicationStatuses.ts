
import { useState, useEffect } from 'react';
import { HELP_REQUEST_STATUSES } from '../utils/constants/statusConstants';
import { getStatusLabel, getAllowedStatusTransitions } from '../utils/helpRequestStatusUtils';

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
      const statusList = Object.entries(HELP_REQUEST_STATUSES).map(([key, value]) => ({
        id: value as string,
        label: getStatusLabel(value as string),
        value: value as string
      }));

      // Sort the statuses in a logical order for workflow progression
      // These are default values - will be filtered by current status in actual implementation
      const developerStatuses = [
        HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,
        HELP_REQUEST_STATUSES.NEED_MORE_INFO,
        HELP_REQUEST_STATUSES.IN_PROGRESS,
        HELP_REQUEST_STATUSES.READY_FOR_QA,
        HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION,
        HELP_REQUEST_STATUSES.RESOLVED,
      ];
      
      const clientStatuses = [
        HELP_REQUEST_STATUSES.APPROVED,
        HELP_REQUEST_STATUSES.QA_PASS,
        HELP_REQUEST_STATUSES.QA_FAIL,
        HELP_REQUEST_STATUSES.RESOLVED,
        HELP_REQUEST_STATUSES.CANCELLED,
      ];

      // Choose appropriate statuses based on user type
      const orderedStatuses = userType === 'client' ? clientStatuses : developerStatuses;

      // Filter and sort the status list
      const formattedStatuses: ApplicationStatus[] = statusList
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
