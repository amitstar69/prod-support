
import React from 'react';
import { Badge } from '../ui/badge';

interface PendingApplicationsBadgeProps {
  count: number;
}

const PendingApplicationsBadge = ({ count }: PendingApplicationsBadgeProps) => {
  if (count <= 0) return null;

  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
      Pending Applications ({count})
    </Badge>
  );
};

export default PendingApplicationsBadge;
