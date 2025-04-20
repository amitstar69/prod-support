
import React from 'react';
import { 
  Clock, 
  ArrowRightCircle,
  ClipboardCheck, 
  UserCheck, 
  ThumbsUp, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface RequestStatusFlowProps {
  currentStatus: string;
  userType?: 'client' | 'developer';
  error?: string | null;
}

const RequestStatusFlow: React.FC<RequestStatusFlowProps> = ({ 
  currentStatus,
  userType = 'client',
  error = null
}) => {
  // Define the statuses in the flow with roles that can trigger them
  const statuses = [
    { 
      id: 'in-progress', 
      label: 'In Progress', 
      icon: <ArrowRightCircle className="h-4 w-4" />,
      allowedRoles: ['developer']
    },
    { 
      id: 'developer-qa', 
      label: 'Dev QA', 
      icon: <ClipboardCheck className="h-4 w-4" />,
      allowedRoles: ['developer']
    },
    { 
      id: 'client-review', 
      label: 'Review', 
      icon: <UserCheck className="h-4 w-4" />,
      allowedRoles: ['client', 'developer']
    },
    { 
      id: 'client-approved', 
      label: 'Approved', 
      icon: <ThumbsUp className="h-4 w-4" />,
      allowedRoles: ['client']
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: <CheckCircle className="h-4 w-4" />,
      allowedRoles: ['developer']
    }
  ];

  // Find the current status index
  const currentIndex = statuses.findIndex(status => status.id === currentStatus);
  
  const isActive = (index: number) => {
    if (currentStatus === 'cancelled') return false;
    return index <= currentIndex;
  };

  const canUpdateStatus = (status: typeof statuses[0]) => {
    return status.allowedRoles.includes(userType);
  };

  // For waiting statuses
  const waitingStatuses = ['open', 'pending', 'matching', 'scheduled'];
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (waitingStatuses.includes(currentStatus)) {
    return (
      <div className="py-2 px-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800 flex items-center">
        <Clock className="h-5 w-5 text-blue-500 mr-2" />
        <span className="text-sm text-blue-700 dark:text-blue-300">
          Waiting for developer assignment
        </span>
      </div>
    );
  }

  if (currentStatus === 'cancelled') {
    return (
      <div className="py-2 px-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 flex items-center">
        <Clock className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-sm text-red-700 dark:text-red-300">
          This request has been cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {statuses.map((status, index) => (
        <React.Fragment key={status.id}>
          <div className="flex flex-col items-center">
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isActive(index) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}
              `}
            >
              {status.icon}
            </div>
            <span 
              className={`
                text-xs mt-1
                ${isActive(index) 
                  ? 'font-medium text-foreground' 
                  : 'text-muted-foreground'}
              `}
            >
              {status.label}
            </span>
          </div>

          {/* Show connector line between status items except for the last one */}
          {index < statuses.length - 1 && (
            <div 
              className={`
                flex-1 h-0.5 mx-1
                ${isActive(index + 1) ? 'bg-primary' : 'bg-muted'}
              `}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RequestStatusFlow;
