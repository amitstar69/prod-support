
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface TicketLoadingProps {
  onBack: () => void;
}

const TicketLoading: React.FC<TicketLoadingProps> = ({ onBack }) => {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Loading ticket details...</h1>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketLoading;
