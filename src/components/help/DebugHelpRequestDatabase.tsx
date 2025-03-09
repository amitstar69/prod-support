
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { testHelpRequestStorage, createSampleHelpRequest } from '../../integrations/supabase/helpRequestsDebug';
import { HelpRequestStatus } from '../../types/helpRequest';

const DebugHelpRequestDatabase = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sampleHelpRequest, setSampleHelpRequest] = useState<any>(null);

  const runDatabaseTest = async () => {
    setIsLoading(true);
    try {
      const result = await testHelpRequestStorage();
      setTestResult(result);
      toast.success('Database test completed');
    } catch (error) {
      console.error('Error testing database:', error);
      toast.error('Database test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleRequest = async () => {
    setIsLoading(true);
    try {
      const result = await createSampleHelpRequest();
      setSampleHelpRequest(result);
      
      if (result.success) {
        toast.success('Sample help request created successfully');
      } else {
        toast.error(`Failed to create sample: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating sample request:', error);
      toast.error('Failed to create sample help request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Database Debugging Tools</CardTitle>
        <CardDescription>Test the help request database connectivity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={runDatabaseTest} 
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Database Connection'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={createSampleRequest}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Sample Help Request'}
            </Button>
          </div>
          
          {testResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <JsonView data={testResult} />
              </div>
            </div>
          )}
          
          {sampleHelpRequest && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Sample Help Request:</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <JsonView data={sampleHelpRequest} />
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div className="text-sm text-muted-foreground">
            <p>These tools are for development and testing purposes only.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugHelpRequestDatabase;
