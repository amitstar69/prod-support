
export const getTicketStatusStyles = (status: string) => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  const statusStyles: Record<string, string> = {
    'open': `${baseClasses} bg-blue-100 text-blue-800`,
    'accepted': `${baseClasses} bg-green-100 text-green-800`,
    'in_progress': `${baseClasses} bg-yellow-100 text-yellow-800`,
    'needs_info': `${baseClasses} bg-orange-100 text-orange-800`,
    'completed': `${baseClasses} bg-green-500 text-white`,
    'closed': `${baseClasses} bg-gray-200 text-gray-800`,
    'pending_review': `${baseClasses} bg-purple-100 text-purple-800`,
    'pending_match': `${baseClasses} bg-indigo-100 text-indigo-800`,
    'dev_requested': `${baseClasses} bg-teal-100 text-teal-800`,
    'awaiting_client_approval': `${baseClasses} bg-pink-100 text-pink-800`
  };

  return statusStyles[status] || `${baseClasses} bg-gray-100 text-gray-800`;
};

export const formatTicketStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
