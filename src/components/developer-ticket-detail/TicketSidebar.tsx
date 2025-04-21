
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "../../components/ui/card";
import { CalendarClock, Clock, DollarSign, Zap, ClipboardCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { HelpRequest } from "../../types/helpRequest";

interface TicketSidebarProps {
  ticket: HelpRequest;
  canSubmitQA: boolean;
  onSubmitQA: () => void;
  formatDate: (dateString?: string) => string;
}

const TicketSidebar: React.FC<TicketSidebarProps> = ({
  ticket,
  canSubmitQA,
  onSubmitQA,
  formatDate
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Time and budget information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              Request Submitted
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(ticket.created_at)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Estimated Duration
            </h3>
            <p className="text-sm text-muted-foreground">
              {ticket.estimated_duration} minutes
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </h3>
            <p className="text-sm text-muted-foreground">
              {ticket.budget_range}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Urgency
            </h3>
            <Badge
              variant="outline"
              className={`
                ${
                  ticket.urgency === "low"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : ticket.urgency === "high"
                    ? "bg-orange-50 text-orange-800 border-orange-200"
                    : ticket.urgency === "critical"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-yellow-50 text-yellow-800 border-yellow-200"
                } capitalize
              `}
            >
              {ticket.urgency}
            </Badge>
          </div>
        </CardContent>
      </Card>
      {canSubmitQA && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submit for QA</CardTitle>
            <CardDescription>Mark your work as ready for review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              When you've completed the requested work, submit it for QA and client review.
            </p>
            <Button
              className="w-full"
              onClick={onSubmitQA}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Submit for QA
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TicketSidebar;
