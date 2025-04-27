
import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { User } from 'lucide-react';

interface PendingApplicationsBadgeProps {
  count: number;
}

const PendingApplicationsBadge = ({ count }: PendingApplicationsBadgeProps) => {
  if (count <= 0) return null;

  return (
    <div className="mt-2">
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {count} developer{count !== 1 ? 's' : ''} applied
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApplicationsBadge;
