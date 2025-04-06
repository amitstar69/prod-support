
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface CertificationsSectionProps {
  certifications: Certification[];
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications }) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {certifications.map((cert: any, index: number) => (
          <div key={index}>
            <h3 className="font-medium">{cert.name}</h3>
            <p className="text-sm text-muted-foreground">{cert.issuer}, {cert.year}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CertificationsSection;
