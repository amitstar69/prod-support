
// Export client
export * from './client';

// Export from realtime.ts - fixing the checkTableInfo export issue
export { 
  setupHelpRequestsSubscription,
  setupApplicationsSubscription
} from './realtime';

// Export from setupRealtime.ts with the enableRealtimeForTable function
export {
  enableRealtimeForTable,
  setupAllRealtimeTables
} from './setupRealtime';

// Export the status constants
export { VALID_MATCH_STATUSES } from './helpRequestsApplications';

// Export from new developers module
export * from './developers';

// Export everything else from the other modules
export * from './profiles';
export * from './helpRequests';
export * from './helpRequestsDebug';
export * from './helpRequestsUtils';
export * from './helpRequestsApplications';
export * from './testing';
export * from './notifications';
export * from './chat';
