
import React from 'react';
import { Briefcase, Clock, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

const DashboardBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-blue-900 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Available Gigs</h1>
            <p className="text-blue-100 max-w-2xl">
              Browse and apply for help requests from clients looking for technical assistance. Match your skills with clients who need your expertise.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span>Apply to multiple gigs</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4 text-blue-300" />
                <span>Get paid for your time</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                <Briefcase className="h-4 w-4 text-yellow-300" />
                <span>Build your expertise</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start">
            <Button className="bg-white text-blue-900 hover:bg-blue-50 mb-2 w-full md:w-auto">
              My Applications
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white w-full md:w-auto">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBanner;
