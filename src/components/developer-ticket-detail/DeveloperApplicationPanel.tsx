
import React from "react";
import RequestStatusFlow from "../../components/help/RequestStatusFlow";
import DeveloperStatusUpdate from "../../components/help/DeveloperStatusUpdate";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/button";
import { HelpRequest } from "../../types/helpRequest";

interface DeveloperApplicationPanelProps {
  devUpdateVisibility: { show: boolean; reason: string };
  ticket: HelpRequest;
  ticketId: string | undefined;
  userType: string | null | undefined;
  applicationStatus: string | null;
  hasApplied: boolean;
  onApply: () => void;
  fetchLatestTicketData: () => void;
}

const DeveloperApplicationPanel: React.FC<DeveloperApplicationPanelProps> = ({
  devUpdateVisibility,
  ticket,
  ticketId,
  userType,
  applicationStatus,
  hasApplied,
  onApply,
  fetchLatestTicketData
}) => {
  if (devUpdateVisibility.show) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status & Progress</CardTitle>
          <CardDescription>
            {ticket?.status && `Current: ${ticket.status}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RequestStatusFlow
            currentStatus={ticket?.status || ""}
            userType={userType}
          />
          <div className="mt-4">
            <DeveloperStatusUpdate
              ticketId={ticketId || ""}
              currentStatus={ticket?.status || ""}
              onStatusUpdated={fetchLatestTicketData}
            />
          </div>
        </CardContent>
      </Card>
    );
  } else if (devUpdateVisibility.reason === "Waiting for client approval") {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status & Progress</CardTitle>
          <CardDescription>Current: {ticket?.status || ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestStatusFlow currentStatus={ticket?.status || ""} userType={userType} />
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Waiting for Client Approval</AlertTitle>
            <AlertDescription>
              Your application to this ticket is pending client approval.
              Status updates will be available if your application is approved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  } else if (devUpdateVisibility.reason === "Rejected by client") {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status & Progress</CardTitle>
          <CardDescription>Current: {ticket?.status || ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestStatusFlow currentStatus={ticket?.status || ""} userType={userType} />
          <Alert variant="destructive" className="mt-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Application Rejected</AlertTitle>
            <AlertDescription>
              Your application was rejected. You can't update this ticket.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!hasApplied) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Apply for This Ticket</CardTitle>
          <CardDescription>Share your expertise with the client</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to help with this problem? Submit your application to connect with the client and start earning.
          </p>
          <Button
            className="w-full"
            onClick={onApply}
            disabled={ticket?.status !== 'pending_match'}
          >
            {ticket?.status === 'pending_match' ? 'Apply Now' : 'Unavailable'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default: application submitted status
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>Your application for this ticket</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-center">
          <h3 className="font-medium text-blue-800">Application Submitted</h3>
          <p className="text-sm text-blue-700 mt-1">
            Status: <span className="font-medium capitalize">{applicationStatus || 'Pending Review'}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperApplicationPanel;
