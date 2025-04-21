
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import LoginPrompt from '../components/dashboard/LoginPrompt';

const DeveloperDashboard: React.FC = () => {
  const isLoggedIn = false; // This would normally come from auth context
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>
        
        {!isLoggedIn && <LoginPrompt />}
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">18</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Earnings This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$840</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Help Requests</h2>
          <Button size="sm" variant="outline">View All</Button>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>React useEffect causing infinite loop</CardTitle>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Medium Priority</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4 line-clamp-2">
                I have a useEffect hook that seems to be causing an infinite loop. I'm not sure how to fix it.
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">React</span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">JavaScript</span>
                </div>
                <a href="/ticket/1" className="text-primary hover:underline text-sm">View Details</a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>Database query performance issue</CardTitle>
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">High Priority</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4 line-clamp-2">
                My PostgreSQL query is taking too long to execute. Need help optimizing it.
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">SQL</span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">PostgreSQL</span>
                </div>
                <a href="/ticket/2" className="text-primary hover:underline text-sm">View Details</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
