
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MessageSquare, 
  Video, 
  CreditCard, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/auth';

interface ProfileSidebarProps {
  activeTab: string;
  userType: 'client' | 'developer';
  onTabChange: (tab: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  activeTab, 
  userType,
  onTabChange 
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside>
      <div className="flex flex-col gap-1">
        <button 
          className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted transition-colors'}`}
          onClick={() => onTabChange('profile')}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </button>
        
        <button 
          className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'messages' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted transition-colors'}`}
          onClick={() => onTabChange('messages')}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Messages</span>
        </button>
        
        <button 
          className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'sessions' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted transition-colors'}`}
          onClick={() => onTabChange('sessions')}
        >
          <Video className="h-5 w-5" />
          <span>Sessions</span>
        </button>
        
        {userType === 'client' ? (
          <button 
            className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'payments' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted transition-colors'}`}
            onClick={() => onTabChange('payments')}
          >
            <CreditCard className="h-5 w-5" />
            <span>Payments</span>
          </button>
        ) : (
          <button 
            className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'earnings' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted transition-colors'}`}
            onClick={() => onTabChange('earnings')}
          >
            <CreditCard className="h-5 w-5" />
            <span>Earnings</span>
          </button>
        )}
        
        <button 
          className={`flex items-center gap-3 px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted transition-colors'}`}
          onClick={() => onTabChange('settings')}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
