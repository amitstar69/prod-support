
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';
import { Alert, AlertDescription } from '../ui/alert';
import { getStatusLabel, getAllowedStatusTransitions } from '../../utils/helpRequestStatusUtils';
import { Button } from '../ui/button';

// This component is now deprecated and replaced by StatusActionCard
// It's kept for backwards compatibility but will be removed in a future update
interface ClientActionStatusProps {
  ticketId: string;
  currentStatus?: string;
  onStatusUpdate?: () => void;
}

const ClientActionStatus: React.FC<ClientActionStatusProps> = ({
  ticketId,
  currentStatus = '',
  onStatusUpdate
}) => {
  console.log('[ClientActionStatus] This component is deprecated. Use StatusActionCard instead.');
  return null;
};

export default ClientActionStatus;
