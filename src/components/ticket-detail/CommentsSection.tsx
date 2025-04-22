
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

</lov_write>

---

<lov-write file_path="src/components/ticket-detail/ClientEditSection.tsx">
import React from 'react';

const ClientEditSection = ({
  visible,
  status,
  ticket,
  onTicketUpdated,
  canSubmitQA,
  onSubmitQA,
  formatDate
}: any) => {
  if (!visible) return null;
  const TicketSidebar = require("../../components/developer-ticket-detail/TicketSidebar").default;
  return (
    <TicketSidebar
      ticket={ticket}
      canSubmitQA={canSubmitQA}
      onSubmitQA={onSubmitQA}
      formatDate={formatDate}
      onTicketUpdated={onTicketUpdated}
    />
  );
};

export default ClientEditSection;

