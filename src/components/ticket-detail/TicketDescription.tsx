
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { HelpRequest } from "../../types/helpRequest";

interface TicketDescriptionProps {
  ticket: HelpRequest;
}

const TicketDescription: React.FC<TicketDescriptionProps> = ({ ticket }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Description</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="whitespace-pre-wrap">{ticket.description}</div>
          </div>
          
          {ticket.technical_area && ticket.technical_area.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Technical Areas</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.technical_area.map((area, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {ticket.code_snippet && (
            <div>
              <h3 className="text-sm font-medium mb-2">Code Snippet</h3>
              <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-sm">
                <code>{ticket.code_snippet}</code>
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDescription;
