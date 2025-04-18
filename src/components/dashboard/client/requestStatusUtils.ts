
import { Clock, BarChart3, Calendar, CheckCircle2, AlertCircle, User } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'matching':
      return <User className="h-5 w-5 text-blue-500" />;
    case 'in-progress':
      return <BarChart3 className="h-5 w-5 text-purple-500" />;
    case 'scheduled':
      return <Calendar className="h-5 w-5 text-indigo-500" />;
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export const getStatusDescription = (status: string) => {
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
