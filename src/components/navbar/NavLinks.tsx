import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';

// This component is now mostly redundant as we've moved the navigation links
// directly into the DesktopNav and MobileNav components.
// Keeping this stub for backwards compatibility in case it's referenced elsewhere.
const NavLinks: React.FC = () => {
  const { userType } = useAuth();
  const isDeveloper = userType === 'developer';

  return null; // Returning null as this component is now deprecated
};

export default NavLinks;
