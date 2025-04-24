
import { useState, useEffect } from 'react';
import { UserType, getAllowedStatusTransitions } from '../../utils/helpRequestStatusUtils';

export const useStatusTransitions = (currentStatus: string, userType: UserType) => {
  const [availableTransitions, setAvailableTransitions] = useState<string[]>([]);

  useEffect(() => {
    if (!currentStatus || !userType) {
      setAvailableTransitions([]);
      return;
    }

    const transitions = getAllowedStatusTransitions(currentStatus, userType);
    setAvailableTransitions(transitions);
  }, [currentStatus, userType]);

  return { availableTransitions };
};
