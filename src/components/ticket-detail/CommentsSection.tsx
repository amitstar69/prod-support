import React from 'react';
import ChatCommentsPanel from "../tickets/ChatCommentsPanel";
import TicketComments from "../tickets/TicketComments";

interface CommentsSectionProps {
  visible: boolean;
  ticket: HelpRequest;
  ticketId?: string;
  userId: string;
  role?: string;
  userRole?: string;
}

const CommentsSection = ({
  visible,
  ticket,
  ticketId,
  userId,
  role,
  userRole,
}: CommentsSectionProps) => {
  if (!visible) return null;
  if (role === "developer") {
    return <ChatCommentsPanel ticketId={ticketId} userId={userId} />;
  }
  return (
    <TicketComments
      ticketId={ticketId}
      userRole={role || userRole}
      userId={userId}
    />
  );
};

export default CommentsSection;
