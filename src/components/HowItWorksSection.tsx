
import React from 'react';
import { MessageSquare, Search, Code, CreditCard } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: "Describe Your Issue",
      description: "Tell us what you need help with and we'll match you with the right expert."
    },
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: "Get Matched Instantly",
      description: "Our AI pairs you with available developers who have the exact skills you need."
    },
    {
      icon: <Code className="h-6 w-6 text-white" />,
      title: "Collaborate in Real-Time",
      description: "Work together via chat, voice, or video with screen sharing and code editing."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-white" />,
      title: "Pay Only For What You Use",
      description: "Flexible pricing based on session length, with no long-term commitments."
    }
  ];

  return (
    <section className="py-20 bg-[#1E3A8A] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="heading-2 mb-4">How It Works</h2>
          <p className="body-text text-white/80 max-w-2xl mx-auto">
            Our simple 4-step process connects you with expert developers in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-full bg-[#00B4D8] flex items-center justify-center mb-4 shadow-lg">
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-white/20 -z-10 transform -translate-y-1/2"></div>
                )}
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#FF8800] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
