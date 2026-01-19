import React, { useState } from 'react';
import { DeveloperApplication } from './useTicketApplications';

interface ApplicationCardProps {
  application: DeveloperApplication;
  onApprove: (applicationId: string) => Promise<void>;
  onReject: (applicationId: string, reason?: string) => Promise<void>;
  isClient: boolean;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onApprove,
  onReject,
  isClient
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!isClient || application.status !== 'pending') return;

    setIsApproving(true);
    try {
      await onApprove(application.id);
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!isClient || application.status !== 'pending') return;

    setIsRejecting(true);
    try {
      await onReject(application.id, rejectReason || undefined);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Developer Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {application.developer?.image ? (
              <img
                src={application.developer.image}
                alt={application.developer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {application.developer?.name?.charAt(0).toUpperCase() || 'D'}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {application.developer?.name || 'Developer'}
              </h3>
              {application.developer?.location && (
                <p className="text-sm text-gray-500">{application.developer.location}</p>
              )}
            </div>
          </div>
          <div>{getStatusBadge(application.status)}</div>
        </div>

        {/* Application Details */}
        <div className="space-y-3 mb-4">
          {application.proposed_message && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                {application.proposed_message}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {application.proposed_rate !== null && (
              <div>
                <p className="text-sm font-medium text-gray-700">Proposed Rate:</p>
                <p className="text-lg font-semibold text-green-600">
                  ${application.proposed_rate}/hour
                </p>
              </div>
            )}

            {application.proposed_duration !== null && (
              <div>
                <p className="text-sm font-medium text-gray-700">Estimated Duration:</p>
                <p className="text-lg font-semibold text-blue-600">
                  {application.proposed_duration} hours
                </p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Applied on {formatDate(application.created_at)}
          </div>
        </div>

        {/* Action Buttons - Only show for clients and pending applications */}
        {isClient && application.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isApproving ? 'Approving...' : 'Approve Application'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Decline Application
            </button>
          </div>
        )}

        {/* Approved/Rejected Status Messages */}
        {application.status === 'approved' && (
          <div className="pt-4 border-t">
            <p className="text-green-700 bg-green-50 p-3 rounded-md">
              ✓ This application has been approved. The developer can now start working on this ticket.
            </p>
          </div>
        )}

        {application.status === 'rejected' && (
          <div className="pt-4 border-t">
            <p className="text-red-700 bg-red-50 p-3 rounded-md">
              ✗ This application has been declined.
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Decline Application</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to decline this application? You can optionally provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              className="w-full border rounded-lg p-3 mb-4 min-h-24"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isRejecting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isRejecting ? 'Declining...' : 'Decline Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
