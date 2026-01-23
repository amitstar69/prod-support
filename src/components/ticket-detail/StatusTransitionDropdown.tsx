import React, { useState } from 'react';                                                                                                                                           
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';                                                                                      
  import { Button } from '../ui/button';                                                                                                                                             
  import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';                                                                                                             
  import { supabase } from '../../integrations/supabase/client';                                                                                                                     
  import { toast } from 'sonner';                                                                                                                                                    
  import { TicketStatus, TicketStatusLabels } from '../../utils/constants/ticketStatuses';                                                                                           
                                                                                                                                                                                     
  interface StatusTransitionDropdownProps {                                                                                                                                          
    ticketId: string;                                                                                                                                                                
    currentStatus: string;                                                                                                                                                           
    userRole: 'client' | 'developer';                                                                                                                                                
    onStatusChange: () => void;                                                                                                                                                      
  }                                                                                                                                                                                  
                                                                                                                                                                                     
  // Define valid transitions                                                                                                                                                        
  const getValidTransitions = (status: string, role: 'client' | 'developer'): string[] => {                                                                                          
    if (status === TicketStatus.IN_PROGRESS && role === 'developer') {                                                                                                               
      return [TicketStatus.READY_FOR_CLIENT_QA];                                                                                                                                     
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if (status === TicketStatus.READY_FOR_CLIENT_QA && role === 'client') {                                                                                                          
      return [TicketStatus.RESOLVED, TicketStatus.REOPENED];                                                                                                                         
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if (status === TicketStatus.REOPENED && role === 'developer') {                                                                                                                  
      return [TicketStatus.IN_PROGRESS];                                                                                                                                             
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if ((status === TicketStatus.IN_PROGRESS || status === TicketStatus.REOPENED) && role === 'client') {                                                                            
      return [TicketStatus.CANCELLED_BY_CLIENT];                                                                                                                                     
    }                                                                                                                                                                                
                                                                                                                                                                                     
    return [];                                                                                                                                                                       
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export const StatusTransitionDropdown: React.FC<StatusTransitionDropdownProps> = ({                                                                                                
    ticketId,                                                                                                                                                                        
    currentStatus,                                                                                                                                                                   
    userRole,                                                                                                                                                                        
    onStatusChange                                                                                                                                                                   
  }) => {                                                                                                                                                                            
    const [selectedStatus, setSelectedStatus] = useState<string>('');                                                                                                                
    const [isUpdating, setIsUpdating] = useState(false);                                                                                                                             
                                                                                                                                                                                     
    const validTransitions = getValidTransitions(currentStatus, userRole);                                                                                                           
                                                                                                                                                                                     
    if (validTransitions.length === 0) {                                                                                                                                             
      return (                                                                                                                                                                       
        <Card>                                                                                                                                                                       
          <CardHeader>                                                                                                                                                               
            <CardTitle className="text-lg">Status Actions</CardTitle>                                                                                                                
          </CardHeader>                                                                                                                                                              
          <CardContent>                                                                                                                                                              
            <p className="text-sm text-muted-foreground">                                                                                                                            
              {userRole === 'developer'                                                                                                                                              
                ? 'Waiting for client review.'                                                                                                                                       
                : 'No actions available at this stage.'}                                                                                                                             
            </p>                                                                                                                                                                     
          </CardContent>                                                                                                                                                             
        </Card>                                                                                                                                                                      
      );                                                                                                                                                                             
    }                                                                                                                                                                                
                                                                                                                                                                                     
    const handleStatusChange = async () => {                                                                                                                                         
      if (!selectedStatus) {                                                                                                                                                         
        toast.error('Please select a status');                                                                                                                                       
        return;                                                                                                                                                                      
      }                                                                                                                                                                              
                                                                                                                                                                                     
      setIsUpdating(true);                                                                                                                                                           
      try {                                                                                                                                                                          
        const { error } = await supabase                                                                                                                                             
          .from('help_requests')                                                                                                                                                     
          .update({                                                                                                                                                                  
            status: selectedStatus,                                                                                                                                                  
            updated_at: new Date().toISOString()                                                                                                                                     
          })                                                                                                                                                                         
          .eq('id', ticketId);                                                                                                                                                       
                                                                                                                                                                                     
        if (error) throw error;                                                                                                                                                      
                                                                                                                                                                                     
        toast.success(`Status updated to ${TicketStatusLabels[selectedStatus as keyof typeof TicketStatusLabels]}`);                                                                 
        onStatusChange();                                                                                                                                                            
        setSelectedStatus('');                                                                                                                                                       
      } catch (error) {                                                                                                                                                              
        console.error('Error updating status:', error);                                                                                                                              
        toast.error('Failed to update status');                                                                                                                                      
      } finally {                                                                                                                                                                    
        setIsUpdating(false);                                                                                                                                                        
      }                                                                                                                                                                              
    };                                                                                                                                                                               
                                                                                                                                                                                     
    return (                                                                                                                                                                         
      <Card>                                                                                                                                                                         
        <CardHeader>                                                                                                                                                                 
          <CardTitle className="text-lg">Status Actions</CardTitle>                                                                                                                  
        </CardHeader>                                                                                                                                                                
        <CardContent className="space-y-3">                                                                                                                                          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>                                                                                                          
            <SelectTrigger>                                                                                                                                                          
              <SelectValue placeholder="Change status..." />                                                                                                                         
            </SelectTrigger>                                                                                                                                                         
            <SelectContent>                                                                                                                                                          
              {validTransitions.map(status => (                                                                                                                                      
                <SelectItem key={status} value={status}>                                                                                                                             
                  {TicketStatusLabels[status as keyof typeof TicketStatusLabels]}                                                                                                    
                </SelectItem>                                                                                                                                                        
              ))}                                                                                                                                                                    
            </SelectContent>                                                                                                                                                         
          </Select>                                                                                                                                                                  
                                                                                                                                                                                     
          <Button                                                                                                                                                                    
            onClick={handleStatusChange}                                                                                                                                             
            disabled={!selectedStatus || isUpdating}                                                                                                                                 
            className="w-full"                                                                                                                                                       
          >                                                                                                                                                                          
            {isUpdating ? 'Updating...' : 'Update Status'}                                                                                                                           
          </Button>                                                                                                                                                                  
        </CardContent>                                                                                                                                                               
      </Card>                                                                                                                                                                        
    );                                                                                                                                                                               
  };   
