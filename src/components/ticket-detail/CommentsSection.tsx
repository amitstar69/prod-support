
import React from 'react';
import ChatCommentsPanel from "../tickets/ChatCommentsPanel";
import TicketComments from "../tickets/TicketComments";
import { HelpRequest } from "../../types/helpRequest";

interface CommentsSectionProps {
  visible: boolean;
  ticket: HelpRequest;
  ticketId?: string;
  userId: string;
  role?: string;
  userRole?: string; // Added to accept both role and userRole
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
      userRole={effectiveRole}
      userId={userId}
    />
  );
};

export default CommentsSection;
