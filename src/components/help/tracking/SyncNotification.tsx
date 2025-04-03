
import React from 'react';
import { toast } from 'sonner';

interface SyncNotificationProps {
  dataSource: 'database' | 'local' | 'mixed';
  userId: string;
  isValidUUID: (uuid: string) => boolean;
  syncLocalToDatabase: () => Promise<void>;
}

const SyncNotification: React.FC<SyncNotificationProps> = ({
  dataSource,
  userId,
  isValidUUID,
  syncLocalToDatabase,
}) => {
  if (dataSource === 'local' && isValidUUID(userId)) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
        <p className="font-medium">You have local help requests that can be synchronized with your account.</p>
        <button 
          onClick={syncLocalToDatabase}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Sync to Database
        </button>
      </div>
    );
  }
  
  return null;
};

export default SyncNotification;
