
import React from 'react';
import { HelpRequest, HelpRequestHistoryItem } from '../../types/helpRequest';

export interface HelpRequestHistoryDialogProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

// This is a stub component that will be handled by the existing component
const HelpRequestHistoryDialog: React.FC<HelpRequestHistoryDialogProps> = ({ 
  requestId, 
  isOpen, 
  onClose 
}) => {
  // The actual component is already implemented elsewhere, this is just to provide
  // the correct type definition for the props to fix the TypeScript error
  return null;
};

export default HelpRequestHistoryDialog;
