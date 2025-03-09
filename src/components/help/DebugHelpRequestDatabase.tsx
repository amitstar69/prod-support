
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { debugInspectHelpRequests, createTestHelpRequest } from '../../integrations/supabase/helpRequestsDebug';
import { getClientHelpRequests } from '../../integrations/supabase/helpRequests';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { toast } from 'sonner';

const DebugHelpRequestDatabase = () => {
  const [results, setResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInspectRequests = async () => {
    setIsLoading(true);
    try {
      const data = await debugInspectHelpRequests();
      setResults(data);
      toast.success(`Found ${data?.length || 0} records`);
    } catch (error) {
      console.error('Error inspecting help requests:', error);
      toast.error('Failed to inspect help requests');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTestRequest = async () => {
    setIsLoading(true);
    try {
      // Create a test help request with sample data
      const testData = {
        title: "Test Help Request",
        description: "This is a test help request created for debugging purposes.",
        technical_area: ["React", "TypeScript"],
        urgency: "medium",
        budget_range: "$50-100",
        communication_preference: ["chat"],
        client_id: "3aa56eec-b5d2-43b0-bc86-690d7e2ceead", // Example user ID
        estimated_duration: 60,
        code_snippet: "console.log('Hello, world!');",
        status: "pending" // Added the required status field
      };
      
      const result = await createTestHelpRequest(testData);
      
      if (result.success) {
        toast.success('Test help request created successfully!');
        setResults(result.data);
      } else {
        toast.error(`Failed to create test request: ${result.error}`);
        setResults({ error: result.error });
      }
    } catch (error) {
      console.error('Error creating test help request:', error);
      toast.error('Failed to create test help request');
      setResults({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMyRequests = async () => {
    setIsLoading(true);
    try {
      const clientId = "3aa56eec-b5d2-43b0-bc86-690d7e2ceead"; // Example user ID
      const result = await getClientHelpRequests(clientId);
      
      setResults(result);
      toast.success(`Found ${result.data?.length || 0} requests for this client`);
    } catch (error) {
      console.error('Error fetching client help requests:', error);
      toast.error('Failed to fetch client help requests');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Help Request Database Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            onClick={handleInspectRequests}
            disabled={isLoading}
          >
            Inspect Help Requests
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateTestRequest}
            disabled={isLoading}
          >
            Create Test Request
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchMyRequests}
            disabled={isLoading}
          >
            Fetch My Requests
          </Button>
        </div>
        
        {isLoading && <div className="text-center py-4">Loading...</div>}
        
        {!isLoading && results && (
          <div className="border rounded-md p-4 mt-4 bg-gray-50 max-h-96 overflow-auto">
            <JsonView data={results} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugHelpRequestDatabase;
