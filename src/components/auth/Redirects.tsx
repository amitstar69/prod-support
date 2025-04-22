
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { getUserHomePage } from '../../utils/navigationUtils';

export const UserTypeRedirect = () => {
  const { userType, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const homePath = getUserHomePage(userType);
  return <Navigate to={homePath} replace />;
};

export const UserAccountRedirect = () => {
  const { userType, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const profilePath = userType === 'developer' ? '/developer/profile' : '/client/profile';
  return <Navigate to={profilePath} replace />;
};
