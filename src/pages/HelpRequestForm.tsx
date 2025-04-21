
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const HelpRequestForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Help request submitted');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Submit a Help Request</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your problem</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">Title</label>
                <Input 
                  id="title" 
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <Textarea 
                  id="description" 
                  placeholder="Provide as much detail as possible about what you're trying to accomplish and where you're stuck"
                  required
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="technicalArea" className="block text-sm font-medium">Technical Area</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend Development</SelectItem>
                    <SelectItem value="backend">Backend Development</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="mobile">Mobile Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="codeSnippet" className="block text-sm font-medium">Code Snippet (optional)</label>
                <Textarea 
                  id="codeSnippet" 
                  placeholder="Paste any relevant code here"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="urgency" className="block text-sm font-medium">Urgency</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="How urgent is this issue?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - I need help within a week</SelectItem>
                    <SelectItem value="medium">Medium - I need help within a few days</SelectItem>
                    <SelectItem value="high">High - I need help within 24 hours</SelectItem>
                    <SelectItem value="critical">Critical - I need help ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">Submit Help Request</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HelpRequestForm;
