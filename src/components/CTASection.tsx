
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(0,180,216,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 mb-6">
            Never Get Stuck on Code Problems Again
          </h2>
          <p className="body-text mb-8 mx-auto max-w-2xl">
            Join thousands of developers and companies who use DevConnect to solve technical challenges and accelerate their projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/register" className="button-primary bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 px-8 py-3 flex items-center justify-center">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/developer-registration" className="button-secondary border border-[#1E3A8A]/30 text-[#1E3A8A] hover:bg-[#1E3A8A]/5 px-8 py-3">
              Join as Developer
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#FF8800]" />
              <span>Connect in under 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#FF8800]" />
              <span>100% vetted developers</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#FF8800]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Resolution or money back</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
