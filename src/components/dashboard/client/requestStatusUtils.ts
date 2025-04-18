
import React from 'react';
import { Clock, BarChart3, Calendar, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type StatusIconType = React.ReactNode;

export const getStatusIcon = (status: string): StatusIconType => {
  switch (status) {
    case 'pending':
      return React.createElement(Clock, { className: "h-5 w-5 text-yellow-500" });
    case 'matching':
      return React.createElement(User, { className: "h-5 w-5 text-blue-500" });
    case 'in-progress':
      return React.createElement(BarChart3, { className: "h-5 w-5 text-purple-500" });
    case 'scheduled':
      return React.createElement(Calendar, { className: "h-5 w-5 text-indigo-500" });
    case 'completed':
      return React.createElement(CheckCircle2, { className: "h-5 w-5 text-green-500" });
    case 'cancelled':
      return React.createElement(AlertCircle, { className: "h-5 w-5 text-red-500" });
    default:
      return React.createElement(Clock, { className: "h-5 w-5 text-gray-500" });
  }
};

export const getStatusDescription = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Your request has been posted and is waiting for developers to apply';
    case 'matching':
      return 'Developers are applying to your request';
    case 'scheduled':
      return 'Your session has been scheduled and is awaiting start';
    case 'in-progress':
      return 'Your session is currently in progress';
    case 'completed':
      return 'Your request has been successfully completed';
    case 'cancelled':
      return 'This request has been cancelled';
    default:
      return 'Status unknown';
  }
};
