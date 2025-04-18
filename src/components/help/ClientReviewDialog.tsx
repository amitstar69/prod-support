
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';

export interface ClientReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: HelpRequest;
  onReviewSubmitted: () => void;
}

// This is a stub component that will be handled by the existing component
const ClientReviewDialog: React.FC<ClientReviewDialogProps> = ({ 
  isOpen, 
  onClose,
  request,
  onReviewSubmitted
}) => {
  // The actual component is already implemented elsewhere, this is just to provide
  // the correct type definition for the props to fix the TypeScript error
  return null;
};

export default ClientReviewDialog;
