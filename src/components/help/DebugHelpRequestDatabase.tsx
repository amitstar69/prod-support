
import React, { useState, useEffect } from 'react';
import { debugInspectHelpRequests, createTestHelpRequest } from '../../integrations/supabase/helpRequestsDebug';
import { useAuth } from '../../contexts/auth';
import { Button } from '../ui/button';
import { toast } from 'sonner';

// Check if we're in development environment
const isDevelopment = import.meta.env.MODE === 'development';

// Force hide in production
const forceHidden = true;

const DebugHelpRequestDatabase: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // On component mount, check if we should show the debug component
  useEffect(() => {
    // Only show in development mode, and respect the forceHidden flag
    setIsVisible(isDevelopment && !forceHidden);
  }, []);

  // If component should be hidden, don't render anything
  if (!isVisible) {
    return null;
  }

  const { userId } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

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

    setIsLoading(true);
    try {
      const result = await createTestHelpRequest(userId);
      setTestResult(result);
      
      if (result.success) {
        const storageMethod = result.storageMethod || 'unknown';
        toast.success(`Test help request created successfully in ${storageMethod}`);
      } else {
        toast.error(`Failed to create test request: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error creating test request:', error);
      toast.error('Error creating test request: ' + error.message);
      setTestResult({ success: false, error: error.message });
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
            disabled={isLoading || !userId}
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

        {testResult && (
          <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
            <h3 className="font-medium mb-2">Test Request Result</h3>
            <div className="text-sm">
              <p><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</p>
              {testResult.storageMethod && (
                <p><strong>Storage Method:</strong> {testResult.storageMethod}</p>
              )}
              {testResult.error && (
                <p className="text-red-600"><strong>Error:</strong> {testResult.error}</p>
              )}
              {testResult.data && (
                <div className="mt-2">
                  <p className="font-medium">Data:</p>
                  <pre className="p-2 bg-gray-100 rounded overflow-x-auto text-xs max-h-40">
                    {formatJson(testResult.data)}
                  </pre>
                </div>
              )}
            </div>
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
