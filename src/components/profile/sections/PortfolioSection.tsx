
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface PortfolioItem {
  title: string;
  description: string;
  link?: string;
}

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ portfolioItems }) => {
  if (!portfolioItems || portfolioItems.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {portfolioItems.map((item: any, index: number) => (
          <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <h3 className="font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                <Globe className="w-3.5 h-3.5 mr-1" />
                View Project
              </a>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PortfolioSection;
