
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Developer } from '@/types/product';

interface ProfileSidebarProps {
  developer: Developer;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ developer }) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col">
        <span className="text-3xl font-bold">${developer.hourlyRate}</span>
        <span className="text-muted-foreground">per hour</span>
      </div>
      {developer.minuteRate && (
        <div className="flex flex-col">
          <span className="text-lg font-medium">${developer.minuteRate}</span>
          <span className="text-muted-foreground">per minute</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm mt-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>{developer.availability ? 'Available for work' : 'Limited availability'}</span>
      </div>
      <Button className="mt-4" size="lg">Contact Developer</Button>
      <Button variant="outline" size="lg">Schedule a Session</Button>
    </div>
  );
};

export default ProfileSidebar;
