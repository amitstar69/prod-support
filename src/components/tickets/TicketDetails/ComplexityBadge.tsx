
import React from "react";
import { Badge } from "../../ui/badge";

const badges = {
  easy: {
    text: "Easy",
    className: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700"
  },
  medium: {
    text: "Medium",
    className: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700"
  },
  hard: {
    text: "Hard",
    className: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
  }
};

type ComplexityBadgeProps = {
  level: string;
};

const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({ level }) => {
  const l = (level || "").toLowerCase();
  const badge = badges[l as keyof typeof badges] || badges.medium;
  return (
    <Badge variant="outline" className={badge.className}>
      {badge.text}
    </Badge>
  );
};

export default ComplexityBadge;
