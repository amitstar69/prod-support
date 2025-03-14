
import React from 'react';

const DashboardBanner: React.FC = () => {
  return (
    <div className="bg-secondary/30 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
        <p className="text-muted-foreground">
          Browse and claim help requests from clients looking for technical assistance
        </p>
      </div>
    </div>
  );
};

export default DashboardBanner;
