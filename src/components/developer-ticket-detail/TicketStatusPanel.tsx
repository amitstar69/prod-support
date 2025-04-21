
import React from "react";
import { HelpRequest } from "../../types/helpRequest";
import { ClipboardCheck, Users, Award } from "lucide-react";

const TicketStatusPanel: React.FC<{ ticket: HelpRequest }> = ({ ticket }) => {
  const isInQA = ticket?.status === "ready_for_qa";
  const isInClientReview = ticket?.status === "client_review";
  const isClientApproved = ticket?.status === "client_approved";

  if (!(isInQA || isInClientReview || isClientApproved)) return null;

  return (
    <div className={`mb-6 p-4 rounded-md ${
      isInQA ? 'bg-indigo-50 border border-indigo-200' :
      isInClientReview ? 'bg-orange-50 border border-orange-200' :
      'bg-emerald-50 border border-emerald-200'
    }`}>
      <div className="flex items-center">
        {isInQA && (
          <>
            <ClipboardCheck className="h-5 w-5 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-medium text-indigo-800">Quality Assurance Submitted</h3>
              <p className="text-sm text-indigo-700">
                Your QA has been submitted and is waiting for client review.
              </p>
            </div>
          </>
        )}
        {isInClientReview && (
          <>
            <Users className="h-5 w-5 text-orange-600 mr-3" />
            <div>
              <h3 className="font-medium text-orange-800">In Client Review</h3>
              <p className="text-sm text-orange-700">The client is currently reviewing your work.</p>
            </div>
          </>
        )}
        {isClientApproved && (
          <>
            <Award className="h-5 w-5 text-emerald-600 mr-3" />
            <div>
              <h3 className="font-medium text-emerald-800">Client Approved</h3>
              <p className="text-sm text-emerald-700">
                The client has approved your work! The request will be marked as complete soon.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TicketStatusPanel;
