
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, Check, UserPlus, PenTool } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(0,180,216,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="heading-2 mb-6">
            Ready to get started?
          </h2>
          <p className="body-text mb-8 mx-auto max-w-2xl">
            Choose how you want to use DevConnect - find expert developers or offer your technical expertise
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Looking to hire */}
            <Link 
              to="/register" 
              className="flex flex-col p-6 bg-white hover:bg-[#F8FBFF] border border-[#1E3A8A]/20 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex gap-4 items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-[#6366F1]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">I'm looking to hire</h3>
                  <p className="text-sm text-gray-600">
                    My team needs vetted freelance talent and a premium business solution.
                  </p>
                </div>
              </div>
            </Link>
            
            {/* Option 2: Want to offer services */}
            <Link 
              to="/developer-registration" 
              className="flex flex-col p-6 bg-white hover:bg-[#F8FBFF] border border-[#1E3A8A]/20 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex gap-4 items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-[#00B4D8]/10 flex items-center justify-center">
                  <PenTool className="h-6 w-6 text-[#00B4D8]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">I want to offer Pro services</h3>
                  <p className="text-sm text-gray-600">
                    I'd like to work on business projects as a Pro freelancer or agency.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm mt-10">
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
    </section>
  );
};

export default CTASection;
