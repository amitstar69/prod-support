
import React from "react";
import { Badge } from "../../ui/badge";

type Props = {
  urgency: string;
};

const badgeMap: Record<string, { text: string; className: string }> = {
  low: {
    text: "Low",
    className: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700"
  },
  medium: {
    text: "Medium",
    className: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700"
  },
  high: {
    text: "High",
    className: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700"
  },
  urgent: {
    text: "Urgent",
    className: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
  }
};

const UrgencyBadge: React.FC<Props> = ({ urgency }) => {
  const key = (urgency || "").toLowerCase();
  const badge = badgeMap[key as keyof typeof badgeMap] || badgeMap.medium;
  return (
    <Badge variant="outline" className={badge.className}>
      {badge.text}
    </Badge>
  );
};

export default UrgencyBadge;
