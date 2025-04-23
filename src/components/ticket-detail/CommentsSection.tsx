
import React from 'react';

const CommentsSection = ({
  visible,
  ticket,
  ticketId,
  userId,
  role,
}: any) => {
  if (!visible) return null;
  if (role === "developer") {
    const ChatCommentsPanel = require("../tickets/ChatCommentsPanel").default;
    return <ChatCommentsPanel ticketId={ticketId} userId={userId} />;
  }
  const TicketComments = require("../tickets/TicketComments").default;
  return (
    <TicketComments
      ticketId={ticketId}
      userRole={role}
      userId={userId}
    />
  );
};

export default CommentsSection;
