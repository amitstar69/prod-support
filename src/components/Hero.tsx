
import React from 'react';
import { Shield, Clock, Zap } from 'lucide-react';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  const handleGetHelp = () => {
    if (isAuthenticated && userType === 'client') {
      navigate('/get-help');
    } else if (isAuthenticated && userType === 'developer') {
      navigate('/profile');
    } else {
      navigate('/register', { state: { userType: 'client' } });
    }
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.15),transparent_70%)]"></div>
      
      {/* Developer profile images in background */}
      <div className="absolute inset-0 overflow-hidden -z-5">
        <div className="absolute top-[10%] left-[10%] w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-lg opacity-90">
          <img 
            src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop" 
            alt="Developer" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-[15%] right-[15%] w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-lg opacity-80">
          <img 
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop" 
            alt="Developer" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-[20%] left-[20%] w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-lg opacity-80">
          <img 
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop" 
            alt="Developer" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-[15%] right-[12%] w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-lg opacity-90">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" 
            alt="Developer" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Centered content */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="mb-4 inline-block">
            <span className="inline-flex items-center rounded-full bg-[#00B4D8]/10 px-3 py-1 text-sm font-medium text-[#00B4D8]">
              Developer Support Platform
            </span>
          </div>
          <h1 className="heading-1 mb-6">
            Scale your professional <span className="text-[#00B4D8]">workforce</span> with freelancers
          </h1>
          <p className="body-text mb-10 max-w-2xl mx-auto">
            Connect with specialized developers in minutes for urgent debugging, code reviews, or quick consultations. Get the help you need without the hassle of hiring.
          </p>
        </div>
        
        {/* Centered search bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            className="shadow-lg" 
            placeholder="Search for any service..." 
          />
          
          {/* Features below search */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-[#FF8800]" />
              <span>Match with experts in 5 minutes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-[#FF8800]" />
              <span>100% vetted professionals</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4 text-[#FF8800]" />
              <span>Instant technical solutions</span>
            </div>
          </div>
        </div>
        
        {/* Help CTA button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleGetHelp}
            className="px-8 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
          >
            Get Developer Help Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
