
import React from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  UserCheck,
  CheckCheck,
  FileEdit,
  FileQuestion,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getStatusLabel } from '../../utils/helpRequestStatusUtils';

interface RequestStatusFlowProps {
  currentStatus: string;
}

const RequestStatusFlow: React.FC<RequestStatusFlowProps> = ({ currentStatus }) => {
  // Define the status flow stages
  const stages = [
    {
      key: 'initial',
      statuses: ['submitted', 'pending_match', 'dev_requested', 'awaiting_client_approval'],
      label: 'Initial',
      icon: Clock,
    },
    {
      key: 'setup',
      statuses: ['approved', 'requirements_review', 'need_more_info'],
      label: 'Setup',
      icon: FileQuestion,
    },
    {
      key: 'development',
      statuses: ['in_progress'],
      label: 'Development',
      icon: FileEdit,
    },
    {
      key: 'review',
      statuses: ['ready_for_client_qa', 'qa_fail', 'qa_pass'],
      label: 'Review',
      icon: Users,
    },
    {
      key: 'completion',
      statuses: ['ready_for_final_action', 'resolved'],
      label: 'Completion',
      icon: CheckCheck,
    },
  ];

  // Special statuses that don't follow the normal flow
  const specialStatuses = ['cancelled_by_client'];
  
  // If it's a special status, show a different UI
  if (specialStatuses.includes(currentStatus)) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center justify-center bg-red-100 text-red-800 px-4 py-2 rounded-full">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Cancelled</span>
        </div>
      </div>
    );
  }

  // Find current stage
  const currentStageIndex = stages.findIndex(stage => 
    stage.statuses.includes(currentStatus)
  );

  return (
    <div className="w-full py-4">
      <div className="flex justify-between mb-2">
        {stages.map((stage, index) => {
          const isCurrentStage = stage.statuses.includes(currentStatus);
          const isPastStage = index < currentStageIndex;
          const isFutureStage = index > currentStageIndex;
          
          return (
            <div 
              key={stage.key}
              className={cn(
                "flex flex-col items-center relative",
                isCurrentStage && "text-primary",
                isPastStage && "text-green-500",
                isFutureStage && "text-gray-400"
              )}
            >
              {/* Icon */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isCurrentStage && "bg-primary/10 text-primary border border-primary",
                  isPastStage && "bg-green-100 text-green-600 border border-green-500",
                  isFutureStage && "bg-gray-100 border border-gray-300"
                )}
              >
                {isPastStage ? <CheckCircle className="h-5 w-5" /> : <stage.icon className="h-5 w-5" />}
              </div>
              
              {/* Label */}
              <span className="text-xs mt-2 font-medium">{stage.label}</span>
              
              {/* Current status if we're on current stage */}
              {isCurrentStage && (
                <span className="text-[10px] absolute -bottom-5 whitespace-nowrap">
                  {getStatusLabel(currentStatus)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 mt-5 relative">
        <div 
          className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500 ease-in-out"
          style={{ 
            width: currentStageIndex >= 0 
              ? `${Math.min(100, ((currentStageIndex + 0.25) / stages.length) * 100)}%` 
              : '0%' 
          }}
        />
        {/* Stage dividers */}
        {stages.map((_, index) => (
          <div 
            key={index} 
            className={cn(
              "absolute top-0 h-1 w-0.5",
              index < currentStageIndex ? "bg-primary" : "bg-gray-300"
            )}
            style={{ 
              left: `${((index + 1) / stages.length) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RequestStatusFlow;
