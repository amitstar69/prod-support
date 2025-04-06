
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LanguagesSectionProps {
  languages: string[];
  onChange?: (languages: string[]) => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages, onChange }) => {
  if (!languages || languages.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {languages.map((language: string, index: number) => (
            <Badge key={index} variant="outline">{language}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguagesSection;
