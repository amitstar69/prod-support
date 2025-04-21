
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

// Who is expected to act for each status
const stageRoleMap: Record<string, 'client' | 'developer' | 'either' | 'system' | null> = {
  // old mapping (legacy): currently unused but defined for clarity
  open: null,
  pending: null,
  matching: null,
  scheduled: null,
  in_progress: 'developer',
  developer_qa: 'developer',
  client_review: 'client',
  client_approved: 'client',
  completed: null
};

interface RequestStatusFlowProps {
  currentStatus: string;
  userType?: 'client' | 'developer';
  error?: string | null;
}

const roleLabelMap: Record<'client' | 'developer' | 'either' | 'system', string> = {
  client: 'Client Action',
  developer: 'Developer Action',
  either: 'Client/Developer',
  system: 'System'
};

const statusFlow = [
  {
    id: 'in_progress',
    label: 'In Progress',
    icon: ArrowRightCircle,
    actor: 'developer' as const
  },
  {
    id: 'developer_qa',
    label: 'Dev QA',
    icon: ClipboardCheck,
    actor: 'developer' as const
  },
  {
    id: 'client_review',
    label: 'Review',
    icon: UserCheck,
    actor: 'client' as const
  },
  {
    id: 'client_approved',
    label: 'Approved',
    icon: ThumbsUp,
    actor: 'client' as const
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    actor: 'system' as const
  }
];

const waitingStatuses = ['open', 'pending', 'matching', 'scheduled'];

// Utility
const getStageIndex = (status: string) =>
  statusFlow.findIndex(stage => stage.id === status) !== -1
    ? statusFlow.findIndex(stage => stage.id === status)
    : -1;

const getCurrentActor = (status: string) =>
  statusFlow.find(stage => stage.id === status)?.actor || null;

const RequestStatusFlow: React.FC<RequestStatusFlowProps> = ({
  currentStatus,
  userType = 'client',
  error = null
}) => {
  // Handle error first
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Waiting (pre-matching etc)
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

  // Cancelled
  if (currentStatus === 'cancelled' || currentStatus === 'cancelled_by_client') {
    return (
      <div className="py-2 px-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 flex items-center">
        <Clock className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-sm text-red-700 dark:text-red-300">
          This request has been cancelled
        </span>
      </div>
    );
  }

  // Compute current index and actor
  const currentIndex = getStageIndex(currentStatus);

  // Show "No further actions" if completed or not found in active steps (blocked)
  const noMoreActions =
    currentStatus === 'completed' ||
    currentStatus === 'client_approved' ||
    currentStatus === 'completed' ||
    currentIndex === -1;

  // For system step
  const actorLabel = (actor: 'developer' | 'client' | 'either' | 'system', current: boolean) => {
    if (actor === 'system') return (
      <span className="text-xs text-muted-foreground mt-0.5">System</span>
    );
    if (!current) return (
      <span className="text-xs text-muted-foreground mt-0.5">{roleLabelMap[actor]}</span>
    );
    // For current step
    if (actor === userType)
      return <span className="text-xs text-primary mt-0.5 font-semibold">{roleLabelMap[actor]} (You)</span>;
    return (
      <span className="text-xs text-warning-foreground mt-0.5 font-medium">
        {roleLabelMap[actor]}
      </span>
    );
  };

  // COMPONENT UI FLOW
  return (
    <div>
      <div className="flex items-center justify-between">
        {statusFlow.map((stage, idx) => {
          // State
          const IconComp = stage.icon;
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center min-w-[72px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg animate-scale-in'
                      : isDone
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-muted text-muted-foreground border-muted-foreground opacity-60'
                    }
                  `}
                  style={isActive ? { transform: 'scale(1.1)' } : undefined}
                >
                  <IconComp
                    className={`w-5 h-5
                      ${isActive
                        ? 'animate-pulse'
                        : ''}
                    `}
                  />
                </div>
                <span className={`text-xs mt-2 text-center ${isActive ? 'font-semibold text-primary' : isDone ? 'text-green-700' : 'text-muted-foreground'}`}>
                  {stage.label}
                </span>
                {/* Show who is expected to act */}
                {actorLabel(stage.actor, isActive)}
              </div>
              {/* Connector lines */}
              {idx < statusFlow.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5
                  ${isDone
                    ? 'bg-primary'
                    : isActive
                      ? 'bg-gradient-to-r from-primary to-muted'
                      : 'bg-muted'
                  }`}
                  style={{
                    minWidth: "22px",
                    maxWidth: "50px"
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* At the end, if no further actions */}
      {noMoreActions && (
        <div className="mt-4 flex items-center justify-center rounded bg-slate-50 border border-slate-200 p-2 dark:bg-slate-900 dark:border-slate-800">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-green-800 dark:text-green-200 text-sm font-semibold">
            No further actions available. All stages completed for this request.
          </span>
        </div>
      )}
    </div>
  );
};

export default RequestStatusFlow;
