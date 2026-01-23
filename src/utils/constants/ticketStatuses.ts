// SINGLE SOURCE OF TRUTH FOR ALL TICKET STATUSES                                                                                                                                  
  // Do not create status strings anywhere else in the codebase                                                                                                                      
                                                                                                                                                                                     
  export const TicketStatus = {                                                                                                                                                      
    OPEN: 'open',                                                                                                                                                                    
    AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',                                                                                                                            
    IN_PROGRESS: 'in_progress',                                                                                                                                                      
    READY_FOR_CLIENT_QA: 'ready_for_client_qa',                                                                                                                                      
    RESOLVED: 'resolved',                                                                                                                                                            
    REOPENED: 'reopened',                                                                                                                                                            
    CANCELLED_BY_CLIENT: 'cancelled_by_client',                                                                                                                                      
  } as const;                                                                                                                                                                        
                                                                                                                                                                                     
  export const MatchStatus = {                                                                                                                                                       
    PENDING: 'pending',                                                                                                                                                              
    APPROVED: 'approved',                                                                                                                                                            
    REJECTED: 'rejected',                                                                                                                                                            
  } as const;                                                                                                                                                                        
                                                                                                                                                                                     
  export type TicketStatusType = typeof TicketStatus[keyof typeof TicketStatus];                                                                                                     
  export type MatchStatusType = typeof MatchStatus[keyof typeof MatchStatus];                                                                                                        
                                                                                                                                                                                     
  // Human-readable labels                                                                                                                                                           
  export const TicketStatusLabels: Record<TicketStatusType, string> = {                                                                                                              
    [TicketStatus.OPEN]: 'Open',                                                                                                                                                     
    [TicketStatus.AWAITING_CLIENT_APPROVAL]: 'Awaiting Approval',                                                                                                                    
    [TicketStatus.IN_PROGRESS]: 'In Progress',                                                                                                                                       
    [TicketStatus.READY_FOR_CLIENT_QA]: 'Ready for Review',                                                                                                                          
    [TicketStatus.RESOLVED]: 'Resolved',                                                                                                                                             
    [TicketStatus.REOPENED]: 'Reopened',                                                                                                                                             
    [TicketStatus.CANCELLED_BY_CLIENT]: 'Cancelled',                                                                                                                                 
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  // Status colors for badges                                                                                                                                                        
  export const TicketStatusColors: Record<TicketStatusType, string> = {                                                                                                              
    [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',                                                                                                                                
    [TicketStatus.AWAITING_CLIENT_APPROVAL]: 'bg-yellow-100 text-yellow-800',                                                                                                        
    [TicketStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',                                                                                                                     
    [TicketStatus.READY_FOR_CLIENT_QA]: 'bg-orange-100 text-orange-800',                                                                                                             
    [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',                                                                                                                          
    [TicketStatus.REOPENED]: 'bg-red-100 text-red-800',                                                                                                                              
    [TicketStatus.CANCELLED_BY_CLIENT]: 'bg-gray-100 text-gray-800',                                                                                                                 
  };                                                              
