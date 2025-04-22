
import React, { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { Loader2, UserCircle, Sparkles } from "lucide-react";
import { HelpRequestHistoryItem } from "../../types/helpRequest";

type TicketHistoryAccordionProps = {
  helpRequestId: string;
};

const humanizeChange = (entry: HelpRequestHistoryItem) => {
  // Basic summary; expand as needed
  switch (entry.change_type) {
    case "STATUS_CHANGE":
      return `Status changed from "${entry.previous_status || 'unknown'}" to "${entry.new_status || 'unknown'}".`;
    case "EDIT":
      if (entry.change_details) {
        const changedFields = [];
        if (entry.change_details.title_changed) changedFields.push("title");
        if (entry.change_details.description_changed) changedFields.push("description");
        if (entry.change_details.technical_area_changed) changedFields.push("technical area(s)");
        if (entry.change_details.budget_changed) changedFields.push("budget");
        if (changedFields.length > 0) {
          return `Edited: ${changedFields.join(", ")}`;
        }
      }
      return "Ticket edited";
    case "CANCELLED":
      return `Request cancelled: ${entry.change_details?.cancellation_reason || "No reason provided"}`;
    case "DEVELOPER_QA":
      return "Developer submitted QA notes";
    case "CLIENT_FEEDBACK":
      return "Client submitted feedback";
    default:
      return "Other change";
  }
};

const TicketHistoryAccordion: React.FC<TicketHistoryAccordionProps> = ({ helpRequestId }) => {
  const [items, setItems] = useState<HelpRequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("help_request_history")
        .select("*")
        .eq("help_request_id", helpRequestId)
        .order("changed_at", { ascending: true });
      if (!error && data) setItems(data as HelpRequestHistoryItem[]);
      setLoading(false);
    };
    if (helpRequestId) fetchHistory();
  }, [helpRequestId]);

  return (
    <Accordion type="single" collapsible defaultValue="history">
      <AccordionItem value="history" className="border rounded-lg my-6 bg-white dark:bg-zinc-900 shadow-sm">
        <AccordionTrigger className="text-lg font-semibold p-5">Ticket History</AccordionTrigger>
        <AccordionContent>
          {loading ? (
            <div className="py-8 flex justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>
          ) : items.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              <Sparkles className="mx-auto mb-2 w-6 h-6" />No history yet for this ticket.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <UserCircle className="w-4 h-4 text-muted" />
                      <span className="text-xs text-gray-500">{item.changed_by ? item.changed_by.slice(0, 8) : "unknown"}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(item.changed_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{item.change_type.replace(/_/g, " ")}</span> — {humanizeChange(item)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TicketHistoryAccordion;
