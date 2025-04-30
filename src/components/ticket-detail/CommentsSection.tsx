
import React from 'react';
import ChatCommentsPanel from "../tickets/ChatCommentsPanel";
import TicketComments from "../tickets/TicketComments";
import { HelpRequest } from "../../types/helpRequest";

interface CommentsSectionProps {
  visible: boolean;
  ticket?: HelpRequest; // Optional since it's not always passed
  ticketId?: string;
  userId: string;
  role?: string;
  userRole?: string; // Support both role and userRole for flexibility
  userType?: string; // Added for flexibility
}

const CommentsSection = ({
  visible,
  ticket,
  ticketId,
  userId,
  role,
  userRole,
  userType,
}: CommentsSectionProps) => {
  if (!visible) return null;
  
  // Use the first available role identifier
  const effectiveRole = role || userRole || userType;
  
  if (effectiveRole === "developer") {
    return <ChatCommentsPanel ticketId={ticketId} userId={userId} />;
  }
  
  return (
    <TicketComments
      ticketId={ticketId}
      userId={userId}
      role={effectiveRole}
      ticket={ticket} // Pass the ticket if available
    />
  );
};

export default CommentsSection;
