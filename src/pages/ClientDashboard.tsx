
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const ClientDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saved Developers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5</p>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Recent Help Requests</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>React useEffect causing infinite loop</CardTitle>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">In Progress</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4 line-clamp-2">
                I have a useEffect hook that seems to be causing an infinite loop. I'm not sure how to fix it.
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Last update: 2 hours ago</div>
                <a href="/ticket/1" className="text-primary hover:underline text-sm">View Details</a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>Database query performance issue</CardTitle>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Awaiting Developer</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4 line-clamp-2">
                My PostgreSQL query is taking too long to execute. Need help optimizing it.
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Last update: 5 hours ago</div>
                <a href="/ticket/2" className="text-primary hover:underline text-sm">View Details</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ClientDashboard;
