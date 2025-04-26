
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dashboard (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to your dashboard! This is currently a placeholder page where 
            we'll soon display your most important information and actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
