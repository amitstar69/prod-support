
import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { Loader2, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getUserHomePage } from '../utils/navigationUtils';

const SessionHistory: React.FC = () => {
  const { userId, userType } = useAuth();
  const navigate = useNavigate();
  
  // Get the user's home page for the "Back to Dashboard" button
  const homePath = getUserHomePage(userType);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <History className="w-6 h-6 mr-2 text-primary" />
            <h1 className="text-2xl font-semibold">Session History</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(homePath)}
          >
            Back to Dashboard
          </Button>
        </div>
        
        <div className="bg-card p-8 rounded-xl border border-border/40 text-center">
          <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't completed any help sessions yet. Once you do, they will appear here.
          </p>
          <Button 
            onClick={() => navigate(userType === 'developer' ? '/developer/dashboard' : '/client/help')}
          >
            {userType === 'developer' ? 'Find Help Requests' : 'Get Help Now'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SessionHistory;
