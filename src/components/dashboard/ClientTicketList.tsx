
import React, { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  AlertCircle, 
  Hourglass, 
  CheckCircle2,
  UserCheck,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ClientTicketListProps {
  tickets: HelpRequest[];
}

const ClientTicketList: React.FC<ClientTicketListProps> = ({ tickets }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<string>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleTicketClick = (ticketId: string) => {
    navigate(`/client/tickets/${ticketId}`);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Sort tickets
  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortField === 'ticket_number') {
      return sortDirection === 'asc' 
        ? (a.ticket_number || 0) - (b.ticket_number || 0)
        : (b.ticket_number || 0) - (a.ticket_number || 0);
    }
    
    if (sortField === 'title') {
      return sortDirection === 'asc'
        ? (a.title || '').localeCompare(b.title || '')
        : (b.title || '').localeCompare(a.title || '');
    }
    
    if (sortField === 'status') {
      return sortDirection === 'asc'
        ? (a.status || '').localeCompare(b.status || '')
        : (b.status || '').localeCompare(a.status || '');
    }
    
    // Default sort by updated_at
    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'open':
      case 'pending':
      case 'matching': 
        return <AlertCircle size={16} className="text-blue-500" />;
      case 'claimed':
      case 'in-progress': 
        return <Hourglass size={16} className="text-amber-500" />;
      case 'developer-qa': 
        return <CheckCircle2 size={16} className="text-amber-500" />;
      case 'client-review':
      case 'client-approved': 
        return <UserCheck size={16} className="text-purple-500" />;
      case 'completed':
      case 'resolved': 
        return <CheckCircle2 size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    let classes = "whitespace-nowrap";
    
    switch(status) {
      case 'open':
        return <Badge variant="outline" className={`${classes} bg-blue-50 text-blue-700 border-blue-200`}>Open</Badge>;
      case 'pending':
        return <Badge variant="outline" className={`${classes} bg-blue-50 text-blue-700 border-blue-200`}>Pending</Badge>;
      case 'matching':
        return <Badge variant="outline" className={`${classes} bg-blue-50 text-blue-700 border-blue-200`}>Matching</Badge>;
      case 'claimed':
        return <Badge variant="outline" className={`${classes} bg-amber-50 text-amber-700 border-amber-200`}>Claimed</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className={`${classes} bg-amber-50 text-amber-700 border-amber-200`}>In Progress</Badge>;
      case 'developer-qa':
        return <Badge variant="outline" className={`${classes} bg-amber-50 text-amber-700 border-amber-200`}>Developer QA</Badge>;
      case 'client-review':
        return <Badge variant="outline" className={`${classes} bg-purple-50 text-purple-700 border-purple-200`}>Review Required</Badge>;
      case 'client-approved':
        return <Badge variant="outline" className={`${classes} bg-purple-50 text-purple-700 border-purple-200`}>Approved</Badge>;
      case 'completed':
        return <Badge variant="outline" className={`${classes} bg-green-50 text-green-700 border-green-200`}>Completed</Badge>;
      case 'resolved':
        return <Badge variant="outline" className={`${classes} bg-green-50 text-green-700 border-green-200`}>Resolved</Badge>;
      default:
        return <Badge variant="outline" className={`${classes} bg-gray-50 text-gray-700 border-gray-200`}>{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('ticket_number')}>
              <div className="flex items-center space-x-1">
                <span>Ticket ID</span>
                {renderSortIcon('ticket_number')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
              <div className="flex items-center space-x-1">
                <span>Summary</span>
                {renderSortIcon('title')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer w-[150px]" onClick={() => handleSort('status')}>
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {renderSortIcon('status')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer w-[180px]" onClick={() => handleSort('updated_at')}>
              <div className="flex items-center space-x-1">
                <span>Last Updated</span>
                {renderSortIcon('updated_at')}
              </div>
            </TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTickets.map((ticket) => {
            const ticketKey = ticket.ticket_number 
              ? `TICKET-${ticket.ticket_number}` 
              : `TICKET-${Math.floor(Math.random() * 900) + 100}`;

            return (
              <TableRow 
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => ticket.id && handleTicketClick(ticket.id)}
              >
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    {ticketKey}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(ticket.status)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(ticket.updated_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        ticket.id && handleTicketClick(ticket.id);
                      }}
                    >
                      <ExternalLink size={16} />
                      <span className="sr-only">View Details</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/client/tickets/${ticket.id}/messages`);
                      }}
                    >
                      <MessageSquare size={16} />
                      <span className="sr-only">Messages</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {sortedTickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No tickets found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTicketList;
