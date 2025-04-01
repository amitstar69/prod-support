
// Export client
export * from './client';

// Export from realtime.ts but not the renamed function
export { 
  setupHelpRequestsSubscription,
  setupApplicationsSubscription,
  checkTableInfo
} from './realtime';

// Export from setupRealtime.ts with the enableRealtimeForTable function
export {
  enableRealtimeForTable,
  setupAllRealtimeTables
} from './setupRealtime';

// Export the status constants
export { VALID_MATCH_STATUSES } from './helpRequestsApplications';

// Export everything else from the other modules
export * from './profiles';
export * from './helpRequests';
export * from './helpRequestsDebug';
export * from './helpRequestsUtils';
export * from './helpRequestsApplications';
export * from './testing';
export * from './notifications';
export * from './chat';
