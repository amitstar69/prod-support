
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { getHelpRequestById, createHelpRequest, testDatabaseAccess } from '../../integrations/supabase/helpRequests';
import { toast } from 'sonner';
import { HelpRequest } from '../../types/helpRequest';

const DebugHelpRequestDatabase: React.FC = () => {
  const [requestData, setRequestData] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchHelpRequest = async () => {
    setLoading(true);
    try {
      // You would normally get this ID from a real request
      const testRequestId = '12345';
      const response = await getHelpRequestById(testRequestId);
      
      if (response.success && response.data) {
        setRequestData(response.data);
        toast.success('Request fetched successfully');
      } else {
        toast.error(`Error fetching request: ${response.error}`);
        setRequestData(null);
      }
    } catch (error) {
      console.error('Error in debug fetch:', error);
      toast.error('Exception occurred during fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestRequest = async () => {
    setLoading(true);
    try {
      // Sample test request
      const testRequest = {
        title: 'Debug Test Request',
        description: 'This is a test request created for debugging purposes',
        technical_area: ['Frontend', 'React'],
        urgency: 'Medium',
        budget_range: '$100 - $200',
        communication_preference: ['Chat', 'Video Call'],
        client_id: 'test-client-id', // This would be a real user ID in production
        estimated_duration: 60,
        code_snippet: 'console.log("Test code snippet")'
      };
      
      const response = await createHelpRequest(testRequest);
      
      if (response.success) {
        setRequestData(response.data);
        toast.success('Test request created successfully');
      } else {
        toast.error(`Error creating test request: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating test request:', error);
      toast.error('Exception occurred during test request creation');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDatabaseAccess = async () => {
    setLoading(true);
    try {
      const response = await testDatabaseAccess();
      
      if (response.success) {
        toast.success(`Database connection successful. Found ${response.data?.count || 0} records.`);
      } else {
        toast.error(`Database connection failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Error testing database access:', error);
      toast.error('Exception occurred during database test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Help Request Database Debug</CardTitle>
        <CardDescription>
          Tools for debugging database access for help requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={handleTestDatabaseAccess} 
              disabled={loading}
              variant="outline"
            >
              Test Database Connection
            </Button>
            <Button 
              onClick={handleFetchHelpRequest} 
              disabled={loading}
              variant="outline"
            >
              Fetch Test Request
            </Button>
            <Button 
              onClick={handleCreateTestRequest} 
              disabled={loading}
              variant="outline"
            >
              Create Test Request
            </Button>
          </div>
          
          {requestData && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Request Data:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                {JSON.stringify(requestData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This component is for debugging purposes only.
      </CardFooter>
    </Card>
  );
};

export default DebugHelpRequestDatabase;
