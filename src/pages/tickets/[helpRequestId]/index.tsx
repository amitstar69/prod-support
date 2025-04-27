import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../../integrations/supabase/client';
import StatusDropdown from '../../../components/developer-actions/StatusDropdown';
import { useAuth } from '../../../contexts/auth';
import { Layout } from '../../../components/Layout';

const TicketDetailsPage = () => {
  const { helpRequestId } = useParams();
  const { userType } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('help_requests')
        .update({ status: newStatus })
        .eq('id', helpRequestId);

      if (error) {
        toast.error(`Failed to update status: ${error.message}`);
        return;
      }

      toast.success('Status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Ticket Details
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl">
              View and manage the details of this help request
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Status Actions</h3>
          <StatusDropdown
            defaultStatusId={ticket?.status}
            onStatusChange={handleStatusChange}
            userType={userType as 'client' | 'developer'}
            disabled={isUpdating}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Ticket Information</h3>
          {/* Display other ticket details here */}
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetailsPage;
