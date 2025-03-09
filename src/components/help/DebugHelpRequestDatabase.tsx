
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { inspectHelpRequests, createTestHelpRequest } from '@/integrations/supabase/helpRequestsDebug';
import { toast } from 'sonner';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const DebugHelpRequestDatabase = () => {
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const inspectDatabase = async () => {
    setIsLoading(true);
    try {
      const result = await inspectHelpRequests();
      setDatabaseData(result);
      if (result.error) {
        toast.error(`Error inspecting database: ${result.error}`);
      }
    } catch (error) {
      console.error('Error inspecting database:', error);
      toast.error('Failed to inspect database');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestRequest = async () => {
    setIsCreating(true);
    try {
      const result = await createTestHelpRequest();
      setCreateResult(result);
      if (result.success) {
        toast.success('Test help request created successfully');
      } else if (result.error) {
        toast.error(`Error creating test request: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating test request:', error);
      toast.error('Failed to create test request');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <h2 className="text-xl font-semibold">Debug Database Tools</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={inspectDatabase} disabled={isLoading} variant="secondary">
          {isLoading ? 'Inspecting...' : 'Inspect Help Requests'}
        </Button>
        
        <Button onClick={createTestRequest} disabled={isCreating} variant="secondary">
          {isCreating ? 'Creating...' : 'Create Test Request'}
        </Button>
      </div>
      
      {createResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Request Creation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p><span className="font-medium">Success:</span> {createResult.success ? 'Yes' : 'No'}</p>
              {createResult.data && (
                <p><span className="font-medium">ID:</span> {createResult.data.id}</p>
              )}
              {createResult.error && (
                <p className="text-destructive"><span className="font-medium">Error:</span> {createResult.error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {databaseData && (
        <div>
          <h3 className="text-lg font-medium mb-2">Database Inspection Results</h3>
          <div className="border rounded-md p-4 bg-muted/30 overflow-auto max-h-[400px]">
            <JsonView data={databaseData} style={defaultStyles} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugHelpRequestDatabase;
