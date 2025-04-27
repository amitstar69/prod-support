
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { HelpRequest } from "../../types/helpRequest";
import DeveloperStatusUpdate from "../help/DeveloperStatusUpdate";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info, LockIcon } from "lucide-react";
import { toast } from "sonner";

interface DeveloperApplicationPanelProps {
  devUpdateVisibility: {
    show: boolean;
    reason: string;
  };
  ticket: HelpRequest;
  ticketId?: string;
  userType?: string | null;
  applicationStatus: string | null;
  hasApplied: boolean;
  onApply: () => void;
  fetchLatestTicketData: () => Promise<void>;
  isPaidDeveloper?: boolean;
  freeApplicationsRemaining?: number;
  assignedTicketCount?: number;
  onUpgradeClick?: () => void;
}

const DeveloperApplicationPanel: React.FC<DeveloperApplicationPanelProps> = ({
  devUpdateVisibility,
  ticket,
  ticketId,
  userType,
  applicationStatus,
  hasApplied,
  onApply,
  fetchLatestTicketData,
  isPaidDeveloper = false,
  freeApplicationsRemaining = 0,
  assignedTicketCount = 0,
  onUpgradeClick
}) => {
  if (!ticket) return null;

  const showStatusUpdate = userType === "developer" && hasApplied && applicationStatus === "approved";
  const showApplyButton = userType === "developer" && !hasApplied;

  const handleApplyClick = () => {
    if (isPaidDeveloper || assignedTicketCount < 2) {
      onApply();
    } else {
      toast.error("You've reached your free project limit. Upgrade to continue working!");
      if (onUpgradeClick) {
        onUpgradeClick();
      }
    }
  };

  const renderApplyButton = () => {
    if (isPaidDeveloper) {
      return (
        <Button onClick={handleApplyClick}>
          Apply Now
        </Button>
      );
    } else if (assignedTicketCount < 2) {
      return (
        <Button onClick={handleApplyClick}>
          Apply Now (Free Ticket)
        </Button>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <div className="text-center text-muted-foreground mb-2">
            <div className="text-sm font-medium">Free Ticket Limit Reached</div>
            <div className="text-xs">
              Upgrade to work on more projects!
            </div>
          </div>
          <Button onClick={onUpgradeClick}>
            <LockIcon className="mr-2 h-4 w-4" />
            Upgrade to Continue
          </Button>
        </div>
      );
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Developer Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {showStatusUpdate ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Update Status</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                {applicationStatus || "Unknown"}
              </Badge>
            </div>
            <DeveloperStatusUpdate
              ticketId={ticketId || ticket.id || ''}
              currentStatus={ticket.status || ''}
              onStatusUpdated={fetchLatestTicketData}
            />
          </>
        ) : showApplyButton ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can apply to help with this ticket if you have the required skills and availability.
            </p>
            {renderApplyButton()}
          </div>
        ) : hasApplied ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Application {applicationStatus}</AlertTitle>
              <AlertDescription>
                {applicationStatus === "pending"
                  ? "Your application is pending client approval."
                  : applicationStatus === "rejected"
                  ? "Your application was rejected by the client."
                  : `Application status: ${applicationStatus}`}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You must be logged in as a developer to apply for this ticket.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeveloperApplicationPanel;
