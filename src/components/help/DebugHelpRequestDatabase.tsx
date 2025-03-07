
import React, { useState } from 'react';
import { debugInspectHelpRequests, createTestHelpRequest } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const DebugHelpRequestDatabase: React.FC = () => {
  const { userId } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInspectTable = async () => {
    setIsLoading(true);
    try {
      const info = await debugInspectHelpRequests();
      setDebugInfo(info);
      toast.success('Database inspection complete');
    } catch (error) {
      console.error('Error inspecting database:', error);
      toast.error('Error inspecting database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestRequest = async () => {
    if (!userId) {
      toast.error('No user ID available');
      return;
    }

    if (userId.startsWith('client-')) {
      toast.error('Cannot create test request with a local storage user ID');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTestHelpRequest(userId);
      if (result.success) {
        toast.success('Test help request created successfully');
      } else {
        toast.error(`Failed to create test request: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating test request:', error);
      toast.error('Error creating test request');
    } finally {
      setIsLoading(false);
    }
  };

  const formatJson = (json: any) => {
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="mt-8 p-6 border border-border/40 rounded-xl bg-white">
      <h2 className="text-xl font-semibold mb-4">Help Request Database Debug</h2>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use these tools to debug the help_requests table in the database.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={handleInspectTable}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Inspect help_requests Table'}
          </Button>
          
          <Button 
            onClick={handleCreateTestRequest}
            disabled={isLoading || !userId || userId.startsWith('client-')}
            variant="outline"
            className="bg-secondary/50"
          >
            {isLoading ? 'Loading...' : 'Create Test Help Request'}
          </Button>
        </div>
        
        {userId && (
          <div className="p-3 bg-secondary/20 rounded text-sm overflow-x-auto">
            <p><strong>Current User ID:</strong> {userId}</p>
            <p><strong>ID Type:</strong> {userId.startsWith('client-') ? 'Local Storage (cannot be used with Supabase)' : 'UUID (compatible with Supabase)'}</p>
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Debug Information</h3>
            
            {debugInfo.tableInfoError ? (
              <div className="p-3 bg-red-100 text-red-800 rounded mb-4">
                <p><strong>Error getting table info:</strong> {debugInfo.tableInfoError.message}</p>
              </div>
            ) : debugInfo.tableInfo && (
              <div className="mb-6">
                <h4 className="font-medium mb-1">Table Structure</h4>
                <pre className="p-3 bg-gray-100 rounded overflow-x-auto text-xs max-h-60">
                  {formatJson(debugInfo.tableInfo)}
                </pre>
              </div>
            )}
            
            {debugInfo.recordsError ? (
              <div className="p-3 bg-red-100 text-red-800 rounded">
                <p><strong>Error getting records:</strong> {debugInfo.recordsError.message}</p>
              </div>
            ) : (
              <div>
                <h4 className="font-medium mb-1">Recent Records (max 5)</h4>
                <pre className="p-3 bg-gray-100 rounded overflow-x-auto text-xs max-h-60">
                  {formatJson(debugInfo.records)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugHelpRequestDatabase;
