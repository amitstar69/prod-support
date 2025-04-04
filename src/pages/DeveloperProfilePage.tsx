
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDeveloperById } from '../integrations/supabase/developerSearch';
import { Developer } from '../types/product';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import AboutSection from '../components/profile/AboutSection';
import { ArrowLeft, Star, Clock, Briefcase, Award, Globe, Mail, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DeveloperProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeveloperProfile = async () => {
      if (!id) {
        setError('Developer ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await fetchDeveloperById(id);
        
        if (error) {
          setError(error);
          toast.error('Failed to load developer profile', {
            description: error
          });
        } else if (!data) {
          setError('Developer not found');
          toast.error('Developer not found');
        } else {
          setDeveloper(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast.error('Error loading profile', {
          description: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDeveloperProfile();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-muted-foreground">Loading developer profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !developer) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <Link to="/search" className="inline-flex items-center mb-8 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to search results
          </Link>
          <div className="bg-destructive/10 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              {error || 'Developer not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the developer profile you're looking for.
            </p>
            <Button asChild>
              <Link to="/search">Browse Available Developers</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <Link to="/search" className="inline-flex items-center mb-8 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search results
        </Link>

        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={developer.image} alt={developer.name} />
                <AvatarFallback className="text-xl">{getInitials(developer.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{developer.name}</h1>
                  {developer.featured && (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                      Featured
                    </Badge>
                  )}
                  {developer.online && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      Online
                    </Badge>
                  )}
                </div>
                <p className="text-xl text-muted-foreground mt-1">{developer.category}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {developer.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {developer.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>{developer.rating}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Last active: {developer.lastActive || 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        </div>

        {/* Main content and sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About section */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {developer.description || 'This developer has not added a description yet.'}
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">{developer.experience || 'Experience level not specified'}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            {developer.education && developer.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {developer.education.map((edu: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-sm text-muted-foreground">{edu.institution}, {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {developer.portfolioItems && developer.portfolioItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {developer.portfolioItems.map((item: any, index: number) => (
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
            )}
          </div>

          <div className="space-y-8">
            {/* Skills section */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {developer.skills && developer.skills.length > 0 ? (
                    developer.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="mb-1">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Languages spoken */}
            {developer.languagesSpoken && developer.languagesSpoken.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {developer.languagesSpoken.map((language: string, index: number) => (
                      <Badge key={index} variant="outline">{language}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {developer.certifications && developer.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {developer.certifications.map((cert: any, index: number) => (
                    <div key={index}>
                      <h3 className="font-medium">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}, {cert.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Contact info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {developer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{developer.email}</span>
                  </div>
                )}
                {developer.communicationPreferences && developer.communicationPreferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Preferred Communication</p>
                    <div className="flex flex-wrap gap-2">
                      {developer.communicationPreferences.map((pref: string, index: number) => (
                        <Badge key={index} variant="outline" className="capitalize">{pref}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperProfilePage;
