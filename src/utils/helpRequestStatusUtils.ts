import { TicketStatus, TicketStatusLabels, TicketStatusColors } from './constants/ticketStatuses';                                                                                 
                                                                                                                                                                                     
  export const getTicketStatusStyles = (status: string) => {                                                                                                                         
    return TicketStatusColors[status as keyof typeof TicketStatusColors] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';                                  
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export const formatTicketStatus = (status: string) => {                                                                                                                            
    return TicketStatusLabels[status as keyof typeof TicketStatusLabels] || status                                                                                                   
      .split('_')                                                                                                                                                                    
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))                                                                                                                     
      .join(' ');                                                                                                                                                                    
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export const getStatusLabel = (status: string): string => {                                                                                                                        
    return formatTicketStatus(status);                                                                                                                                               
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export const getStatusDescription = (status: string): string => {                                                                                                                  
    const descriptions: Record<string, string> = {                                                                                                                                   
      [TicketStatus.OPEN]: 'Ticket is open and available for developers to apply.',                                                                                                  
      [TicketStatus.AWAITING_CLIENT_APPROVAL]: 'Developers have applied. Waiting for client to select one.',                                                                         
      [TicketStatus.IN_PROGRESS]: 'Developer is actively working on this ticket.',                                                                                                   
      [TicketStatus.READY_FOR_CLIENT_QA]: 'Developer has submitted work for client review.',                                                                                         
      [TicketStatus.RESOLVED]: 'Issue has been resolved successfully.',                                                                                                              
      [TicketStatus.REOPENED]: 'Client requested changes. Developer needs to continue work.',                                                                                        
      [TicketStatus.CANCELLED_BY_CLIENT]: 'This ticket has been cancelled by the client.'                                                                                            
    };                                                                                                                                                                               
                                                                                                                                                                                     
    return descriptions[status] || 'No description available.';                                                                                                                      
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  interface StatusTransition {                                                                                                                                                       
    from: string;                                                                                                                                                                    
    to: string[];                                                                                                                                                                    
    roles: ('developer' | 'client')[];                                                                                                                                               
  }                                                                                                                                                                                  
                                                                                                                                                                                     
  // MVP Status Transitions matching the Jira-style workflow                                                                                                                         
  const statusTransitions: StatusTransition[] = [                                                                                                                                    
    {                                                                                                                                                                                
      from: TicketStatus.IN_PROGRESS,                                                                                                                                                
      to: [TicketStatus.READY_FOR_CLIENT_QA],                                                                                                                                        
      roles: ['developer']                                                                                                                                                           
    },                                                                                                                                                                               
    {                                                                                                                                                                                
      from: TicketStatus.READY_FOR_CLIENT_QA,                                                                                                                                        
      to: [TicketStatus.RESOLVED, TicketStatus.REOPENED],                                                                                                                            
      roles: ['client']                                                                                                                                                              
    },                                                                                                                                                                               
    {                                                                                                                                                                                
      from: TicketStatus.REOPENED,                                                                                                                                                   
      to: [TicketStatus.IN_PROGRESS],                                                                                                                                                
      roles: ['developer']                                                                                                                                                           
    },                                                                                                                                                                               
    {                                                                                                                                                                                
      from: TicketStatus.IN_PROGRESS,                                                                                                                                                
      to: [TicketStatus.CANCELLED_BY_CLIENT],                                                                                                                                        
      roles: ['client']                                                                                                                                                              
    },                                                                                                                                                                               
    {                                                                                                                                                                                
      from: TicketStatus.REOPENED,                                                                                                                                                   
      to: [TicketStatus.CANCELLED_BY_CLIENT],                                                                                                                                        
      roles: ['client']                                                                                                                                                              
    }                                                                                                                                                                                
  ];                                                                                                                                                                                 
                                                                                                                                                                                     
  export const isValidStatusTransition = (                                                                                                                                           
    from: string,                                                                                                                                                                    
    to: string,                                                                                                                                                                      
    role: 'developer' | 'client'                                                                                                                                                     
  ): boolean => {                                                                                                                                                                    
    const transition = statusTransitions.find(t => t.from === from);                                                                                                                 
    if (!transition) return false;                                                                                                                                                   
                                                                                                                                                                                     
    return transition.to.includes(to) && transition.roles.includes(role);                                                                                                            
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export const getAllowedStatusTransitions = (                                                                                                                                       
    status: string,                                                                                                                                                                  
    role: 'developer' | 'client'                                                                                                                                                     
  ): string[] => {                                                                                                                                                                   
    const transition = statusTransitions.find(t => t.from === status);                                                                                                               
                                                                                                                                                                                     
    if (!transition || !transition.roles.includes(role)) {                                                                                                                           
      return [];                                                                                                                                                                     
    }                                                                                                                                                                                
                                                                                                                                                                                     
    return transition.to;                                                                                                                                                            
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export type { UserType } from '../types/enums';
