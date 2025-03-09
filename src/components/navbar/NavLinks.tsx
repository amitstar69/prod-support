
import { HomeIcon, HelpCircle, Users, LifeBuoy, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';

interface NavLinksProps {
  className?: string;
  isMobile?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ className = '', isMobile = false }) => {
  const { userType } = useAuth();
  
  // Common links for all users
  const commonLinks = [
    {
      name: 'Home',
      href: '/',
      icon: <HomeIcon className="h-5 w-5" />
    },
    {
      name: 'Get Help',
      href: '/get-help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];
  
  // Additional links based on user type
  const typeSpecificLinks = userType === 'developer' ? [
    {
      name: 'Find Work',
      href: '/developer-dashboard',
      icon: <LifeBuoy className="h-5 w-5" />
    }
  ] : userType === 'client' ? [
    {
      name: 'Find Developers',
      href: '/search',
      icon: <Users className="h-5 w-5" />
    }
  ] : [];
  
  // Sessions link for authenticated users
  const sessionsLink = userType ? [
    {
      name: 'My Sessions',
      href: '/sessions',
      icon: <Calendar className="h-5 w-5" />
    }
  ] : [];
  
  // Combine all links
  const links = [...commonLinks, ...typeSpecificLinks, ...sessionsLink];

  return (
    <div className={className}>
      {links.map((link) => (
        <Link
          key={link.name}
          to={link.href}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            isMobile ? 'w-full' : ''
          }`}
        >
          {link.icon}
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
