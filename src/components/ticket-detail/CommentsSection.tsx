
import React from 'react';
import ChatCommentsPanel from "../tickets/ChatCommentsPanel";
import TicketComments from "../tickets/TicketComments";

const CommentsSection = ({
  visible,
  ticket,
  ticketId,
  userId,
  role,
}: any) => {
  if (!visible) return null;
  if (role === "developer") {
    return <ChatCommentsPanel ticketId={ticketId} userId={userId} />;
  }
  return (
    <TicketComments
      ticketId={ticketId}
      userRole={role}
      userId={userId}
    />
  );
};

export default CommentsSection;
