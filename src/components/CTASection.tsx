
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Check } from 'lucide-react';

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
              <Check className="h-5 w-5 text-[#FF8800]" />
              <span>Resolution or money back</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
