
import React from 'react';
import Layout from '../components/Layout';
import TicketStatus from '../components/tickets/TicketStatus';
import { Card, CardContent } from '../components/ui/card';

const TicketStatusTest = () => {
  // Sample list of statuses to display
  const statuses = [
    'open',
    'accepted',
    'in_progress', 
    'needs_info',
    'completed',
    'closed',
    'pending_review',
    'pending_match',
    'dev_requested',
    'awaiting_client_approval'
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Ticket Status Styles Test</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Status Display Examples</h2>
            <div className="flex flex-wrap gap-4">
              {statuses.map((status) => (
                <div key={status} className="flex flex-col items-center">
                  <TicketStatus status={status} />
                  <span className="text-xs text-muted-foreground mt-2">{status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">In Context Examples</h2>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Fix Login Issue</h3>
                  <TicketStatus status="in_progress" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Need help resolving authentication errors in my React application.
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Database Connection Problem</h3>
                  <TicketStatus status="completed" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Can't connect to PostgreSQL database from my Node.js backend.
                </p>
              </div>
              
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">UI Design Consultation</h3>
                  <TicketStatus status="pending_match" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Looking for advice on improving user interface flow.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TicketStatusTest;
