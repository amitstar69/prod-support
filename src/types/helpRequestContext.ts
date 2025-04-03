
import { HelpRequest, HelpRequestMatch } from './helpRequestModels';

export interface HelpRequestContextState {
  helpRequests: HelpRequest[];
  activeRequest: HelpRequest | null;
  isLoading: boolean;
  error: string | null;
}

export interface HelpRequestContextActions {
  createHelpRequest: (request: Partial<HelpRequest>) => Promise<{ success: boolean; error?: string; data?: HelpRequest }>;
  getHelpRequestsForClient: (clientId: string) => Promise<{ success: boolean; error?: string; data?: HelpRequest[] }>;
  getAllPublicHelpRequests: () => Promise<{ success: boolean; error?: string; data?: HelpRequest[] }>;
  getHelpRequest: (requestId: string) => Promise<{ success: boolean; error?: string; data?: HelpRequest }>;
  updateHelpRequest: (requestId: string, updates: Partial<HelpRequest>) => Promise<{ success: boolean; error?: string; data?: HelpRequest }>;
  cancelHelpRequest: (requestId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  setActiveRequest: (request: HelpRequest | null) => void;
}

export interface HelpRequestContextType extends HelpRequestContextState, HelpRequestContextActions {}

export interface HelpRequestMatchContextActions {
  submitDeveloperApplication: (
    requestId: string, 
    developerId: string, 
    message?: string, 
    rate?: number, 
    duration?: number
  ) => Promise<{ success: boolean; error?: string; data?: HelpRequestMatch }>;
  
  getDeveloperApplicationsForRequest: (
    requestId: string
  ) => Promise<{ success: boolean; error?: string; data?: HelpRequestMatch[] }>;
}
