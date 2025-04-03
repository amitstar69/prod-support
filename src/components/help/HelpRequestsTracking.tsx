
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { Loader2, ExternalLink, Clock, AlertCircle, CheckCircle2, Calendar, FileEdit, Play, PauseCircle, UserCheck2, Check } from 'lucide-react';
import { useHelpRequestsTracking } from '../../hooks/help/useHelpRequestsTracking';
import TrackedRequestsList from './tracking/TrackedRequestsList';
import SyncNotification from './tracking/SyncNotification';

// Static configuration and styling
const statusColors = {
  'requirements': 'bg-purple-100 text-purple-800',
  'todo': 'bg-blue-100 text-blue-800',
  'in-progress-unpaid': 'bg-yellow-100 text-yellow-800',
  'in-progress-paid': 'bg-green-100 text-green-800',
  'client-review': 'bg-orange-100 text-orange-800',
  'production': 'bg-pink-100 text-pink-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'matching': 'bg-blue-100 text-blue-800',
  'scheduled': 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-green-100 text-green-800'
};

const statusIcons = {
  'requirements': <FileEdit className="h-4 w-4" />,
  'todo': <Clock className="h-4 w-4" />,
  'in-progress-unpaid': <Play className="h-4 w-4" />,
  'in-progress-paid': <Play className="h-4 w-4 text-green-600" />,
  'client-review': <UserCheck2 className="h-4 w-4" />,
  'production': <PauseCircle className="h-4 w-4" />,
  'completed': <Check className="h-4 w-4" />,
  'cancelled': <AlertCircle className="h-4 w-4" />,
  'pending': <Clock className="h-4 w-4" />,
  'matching': <Loader2 className="h-4 w-4" />,
  'scheduled': <Calendar className="h-4 w-4" />,
  'in-progress': <Loader2 className="h-4 w-4 animate-spin" />
};

const statusLabels = {
  'requirements': 'Requirements',
  'todo': 'To Do',
  'in-progress-unpaid': 'In Progress (Unpaid)',
  'in-progress-paid': 'In Progress (Paid)',
  'client-review': 'Client Review',
  'production': 'In Production',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'pending': 'Pending',
  'matching': 'Matching',
  'scheduled': 'Scheduled',
  'in-progress': 'In Progress'
};

const HelpRequestsTracking: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  
  const {
    helpRequests,
    isLoading,
    error,
    dataSource,
    isValidUUID,
    syncLocalToDatabase,
    formatDate,
    handleViewDetails,
  } = useHelpRequestsTracking(userId, navigate);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Help Requests</h2>
        <button
          onClick={() => navigate('/get-help')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Create New Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline"
          >
            Refresh page
          </button>
        </div>
      )}

      <SyncNotification 
        dataSource={dataSource} 
        userId={userId || ''} 
        isValidUUID={isValidUUID}
        syncLocalToDatabase={syncLocalToDatabase}
      />

      <TrackedRequestsList
        helpRequests={helpRequests}
        statusColors={statusColors}
        statusIcons={statusIcons}
        statusLabels={statusLabels}
        formatDate={formatDate}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default HelpRequestsTracking;
