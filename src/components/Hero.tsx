
import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Shield, Clock, Zap, Search } from 'lucide-react';
import SearchBar from './SearchBar';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_70%,rgba(0,180,216,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-3/5 lg:pr-12 mb-12 lg:mb-0">
            <div className="mb-4 inline-block">
              <span className="inline-flex items-center rounded-full bg-[#00B4D8]/10 px-3 py-1 text-sm font-medium text-[#00B4D8]">
                Developer Support Platform
              </span>
            </div>
            <h1 className="heading-1 mb-6">
              Instant help from <span className="text-[#00B4D8]">expert developers</span> – anytime, anywhere
            </h1>
            <p className="body-text mb-8 max-w-2xl">
              Connect with specialized developers in minutes for urgent debugging, code reviews, or quick consultations. Get the help you need without the hassle of hiring.
            </p>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="button-primary bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 px-6 py-3">
                  Get Started
                </Link>
                <Link to="/developer-registration" className="button-secondary border border-[#1E3A8A]/30 text-[#1E3A8A] hover:bg-[#1E3A8A]/5 px-6 py-3">
                  Join as Developer
                </Link>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-[#FF8800]" />
                <span>Match with an expert in under 5 minutes</span>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/5 relative">
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop"
                  alt="Developer helping client"
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white/90 backdrop-blur-sm p-4 shadow-lg border border-border/20 max-w-[240px] animate-float">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#00B4D8]/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Technical Emergency?</p>
                    <p className="text-xs text-muted-foreground">Get help in minutes, not days</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 rounded-xl bg-white/90 backdrop-blur-sm p-4 shadow-lg border border-border/20 max-w-[240px] animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#00B4D8]/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">100% Vetted Experts</p>
                    <p className="text-xs text-muted-foreground">Proven skills & experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
