
import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import ProfileCompletionBanner from '../components/profile/ProfileCompletionBanner';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { Skeleton } from '@/components/ui/skeleton';

const ClientLanding: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { client, isLoading, profileCompletionPercentage } = useProfileCompletion();

  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Client Dashboard</h1>
          <p className="text-center text-muted-foreground">Manage your help requests and find developers</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <ProfileCompletionBanner 
              profileCompletionPercentage={profileCompletionPercentage} 
              name={client?.name}
            />
            
            {/* Dashboard content will go here */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Active Tickets</h3>
                <p className="text-muted-foreground">
                  You have no active tickets. Create a new help request to get started.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Find Developers</h3>
                <p className="text-muted-foreground">
                  Browse our network of expert developers to find the perfect match for your needs.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Recent Activity</h3>
                <p className="text-muted-foreground">
                  No recent activity to display.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ClientLanding;
