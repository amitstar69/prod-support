
import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { Loader2 } from 'lucide-react';

const SessionHistory: React.FC = () => {
  const { userId } = useAuth();
  
  // This is a placeholder component - we'll implement actual session history later
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold mb-6">Session History</h1>
        
        <div className="bg-white p-8 rounded-xl border border-border/40 text-center">
          <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't completed any help sessions yet. Once you do, they will appear here.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SessionHistory;
