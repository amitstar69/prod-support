
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import SearchBar from './SearchBar';
import { Shield, Clock, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetHelp = () => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated && userType === 'client') {
        navigate('/get-help');
      } else if (isAuthenticated && userType === 'developer') {
        navigate('/profile');
      } else {
        navigate('/register', { state: { userType: 'client' } });
      }
    } catch (error) {
      console.error('Navigation error in Hero:', error);
      toast.error('Navigation failed. Please try clicking again.');
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Simplified background with subtle gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.08),transparent_70%)]"></div>
      
      {/* Professional profile images on sides */}
      <div className="hidden md:block absolute inset-0 overflow-hidden -z-5">
        <div className="absolute left-[5%] top-1/4 w-24 h-24 rounded-xl overflow-hidden shadow-md opacity-90 transform rotate-3">
          <img 
            src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop" 
            alt="Developer profile" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute right-[5%] top-1/3 w-24 h-24 rounded-xl overflow-hidden shadow-md opacity-90 transform -rotate-3">
          <img 
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop" 
            alt="Developer profile" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute left-[8%] bottom-1/4 w-24 h-24 rounded-xl overflow-hidden shadow-md opacity-90 transform -rotate-3">
          <img 
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop" 
            alt="Developer profile" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute right-[8%] bottom-1/3 w-24 h-24 rounded-xl overflow-hidden shadow-md opacity-90 transform rotate-3">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" 
            alt="Developer profile" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Main content with cleaner layout */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline - bold and direct, just like Upwork */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            We connect people to <span className="text-[#00B4D8]">bring projects to life</span>
          </h1>
          
          {/* Cleaner subheading with more whitespace */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Find high-quality technical talent for urgent debugging, code reviews, or quick consultations.
          </p>
          
          {/* Search section with better spacing */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar 
              className="shadow-md" 
              placeholder="Search for any development service..."
            />
          </div>
          
          {/* Help CTA button - more prominent positioning */}
          <div className="mb-12">
            <button
              onClick={handleGetHelp}
              disabled={isLoading}
              className={`px-8 py-4 bg-[#1E3A8A] text-white rounded-full text-lg font-medium hover:bg-[#1E3A8A]/90 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  Connecting
                  <span className="ml-2 flex space-x-1">
                    <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </span>
              ) : (
                'Get Developer Help Now'
              )}
            </button>
          </div>
          
          {/* Features with cleaner layout and more space */}
          <div className="flex flex-wrap justify-center gap-8 mt-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#FF8800]" />
              <span>Match in 5 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#FF8800]" />
              <span>100% vetted professionals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-[#FF8800]" />
              <span>Instant solutions</span>
            </div>
          </div>
          
          {/* Trusted by section similar to Upwork */}
          <div className="mt-16">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Trusted by</p>
            <div className="flex justify-center items-center gap-8 opacity-70">
              <div className="h-8">
                <img src="https://miro.medium.com/v2/resize:fit:8000/1*UzPNplj4B-x2BLnc-Grjmw.png" alt="Google" className="h-full object-contain" />
              </div>
              <div className="h-8">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png" alt="IBM" className="h-full object-contain" />
              </div>
              <div className="h-8">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png" alt="Microsoft" className="h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
