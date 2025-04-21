
// Enhanced RequestStatusFlow for current stage, role-awareness, and visual clarity

import React from "react";
import {
  Clock,
  ArrowRightCircle,
  ClipboardCheck,
  UserCheck,
  ThumbsUp,
  Check,
  AlertTriangle,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

const STAGES = [
  {
    id: "pending_match",
    label: "Pending Match",
    description: "Waiting for developer application",
    icon: <Clock className="h-4 w-4" />,
    expectedActor: "developer",
  },
  {
    id: "dev_requested",
    label: "Developer Application",
    description: "Developer(s) have applied, waiting for client approval",
    icon: <ClipboardCheck className="h-4 w-4" />,
    expectedActor: "client",
  },
  {
    id: "awaiting_client_approval",
    label: "Awaiting Client Approval",
    description: "Client must approve a developer to proceed",
    icon: <UserCheck className="h-4 w-4" />,
    expectedActor: "client",
  },
  {
    id: "approved",
    label: "Approved",
    description: "Developer assigned — ready to start",
    icon: <ThumbsUp className="h-4 w-4" />,
    expectedActor: "developer",
  },
  {
    id: "in_progress",
    label: "In Progress",
    description: "Developer is working",
    icon: <ArrowRightCircle className="h-4 w-4" />,
    expectedActor: "developer",
  },
  {
    id: "ready_for_qa",
    label: "Ready for QA",
    description: "Ready for client review or feedback",
    icon: <ClipboardCheck className="h-4 w-4" />,
    expectedActor: "client",
  },
  {
    id: "qa_feedback",
    label: "QA Feedback",
    description: "Client has requested changes",
    icon: <AlertTriangle className="h-4 w-4" />,
    expectedActor: "developer",
  },
  {
    id: "complete",
    label: "Completed",
    description: "Request is fully complete",
    icon: <Check className="h-4 w-4" />,
    expectedActor: null,
  },
  {
    id: "cancelled_by_client",
    label: "Cancelled",
    description: "Request cancelled by client",
    icon: <ShieldAlert className="h-4 w-4" />,
    expectedActor: null,
  },
  {
    id: "abandoned_by_dev",
    label: "Abandoned",
    description: "Request abandoned by developer",
    icon: <ShieldAlert className="h-4 w-4" />,
    expectedActor: null,
  },
];

function findStageIndex(status: string) {
  return STAGES.findIndex((stage) => stage.id === status);
}
function findStage(status: string) {
  return STAGES.find((stage) => stage.id === status);
}

interface RequestStatusFlowProps {
  currentStatus: string;
  userType?: "client" | "developer";
  error?: string | null;
}

const RequestStatusFlow: React.FC<RequestStatusFlowProps> = ({
  currentStatus,
  userType = "client",
  error = null,
}) => {
  const currentIdx = findStageIndex(currentStatus);
  const currentStage = findStage(currentStatus);

  // Waiting/canceled stages special handling
  const waitingStatuses = ["submitted", "open", "pending", "matching", "scheduled"];
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
  // "Terminal" end/cancel/complete
  if (
    currentStatus === "cancelled_by_client" ||
    currentStatus === "abandoned_by_dev"
  ) {
    return (
      <div className="py-2 px-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 flex items-center">
        <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-sm text-red-700 dark:text-red-300">
          {findStage(currentStatus)?.label || "Request closed"}
        </span>
      </div>
    );
  }
  if (currentStatus === "complete") {
    return (
      <div className="py-2 px-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800 flex items-center">
        <Check className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-sm text-green-700 dark:text-green-300">
          Completed — Nice work!
        </span>
      </div>
    );
  }

  // Show a horizontal status "progress line" for main flow
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {STAGES.slice(0, 8).map((stage, idx) => {
          const isActive = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          // Who is expected at this stage?
          const whoActs =
            stage.expectedActor === "client"
              ? (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Client step
                  </span>
                )
              : stage.expectedActor === "developer"
              ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Developer step
                  </span>
                )
              : null;
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center min-w-[60px]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary"
                      : isActive
                      ? "bg-green-50 text-green-700 border-green-400"
                      : "bg-muted text-muted-foreground border-muted"
                  }`}
                >
                  {stage.icon}
                </div>
                <span
                  className={`text-xs mt-1 whitespace-nowrap ${
                    isCurrent
                      ? "font-semibold text-foreground"
                      : isActive
                      ? "text-green-700"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && whoActs && (
                  <div className="mt-1">{whoActs}</div>
                )}
              </div>
              {idx < 7 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    isActive ? "bg-green-400" : "bg-muted"
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {currentStage?.description && (
        <div className="text-xs mt-2 ml-2 text-muted-foreground flex items-center gap-2">
          <Info /> {currentStage.description}
        </div>
      )}
    </div>
  );
};

function Info() {
  return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
}

export default RequestStatusFlow;

