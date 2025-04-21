
import React from "react";
import { HelpRequest } from "../../types/helpRequest";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator, Badge } from "../../components/ui/card";
import { FileCode, Award, Users, MessageSquare, Code, ClipboardCheck } from "lucide-react";

interface TicketInfoProps {
  ticket: HelpRequest;
}

const TicketInfo: React.FC<TicketInfoProps> = ({ ticket }) => {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>Problem details provided by the client</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-foreground/90">{ticket.description}</p>
          {ticket.code_snippet && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <FileCode className="h-4 w-4" />
                Code Snippet
              </h3>
              <div className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-sm font-mono">
                <pre>{ticket.code_snippet}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Technical Requirements</CardTitle>
          <CardDescription>Skills and expertise needed for this task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Required Technical Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {ticket.technical_area && ticket.technical_area.map((area, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Desired Developer Experience
              </h3>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 capitalize">
                {ticket.preferred_developer_experience || 'Any level'}
              </Badge>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Communication Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {ticket.communication_preference && ticket.communication_preference.map((pref, i) => (
                  <Badge key={i} variant="outline" className="bg-secondary text-secondary-foreground">
                    {pref}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Code className="h-4 w-4" />
                Complexity Level
              </h3>
              <Badge 
                variant="outline"
                className={`${
                  ticket.complexity_level === 'easy' ? 'bg-green-50 text-green-800 border-green-200'
                  : ticket.complexity_level === 'hard' ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-orange-50 text-orange-800 border-orange-200'
                } capitalize`}
              >
                {ticket.complexity_level || 'Medium'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      {ticket?.developer_qa_notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-indigo-600" />
              Quality Assurance Notes
            </CardTitle>
            <CardDescription>QA notes provided by the developer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">
              {ticket.developer_qa_notes}
            </div>
          </CardContent>
        </Card>
      )}
      {ticket?.client_feedback && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Client Feedback
            </CardTitle>
            <CardDescription>Feedback provided by the client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">
              {ticket.client_feedback}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TicketInfo;
