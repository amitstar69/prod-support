
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const HelpRequestDetail: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Help Request Detail Page (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder help request detail page. Actual help request details will be implemented soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpRequestDetail;
