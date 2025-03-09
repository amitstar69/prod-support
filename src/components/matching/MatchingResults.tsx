
import React from 'react';
import { TicketWithMatches, MATCH_SCORE_THRESHOLDS } from '../../types/matching';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CheckCircle, AlertCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface MatchingResultsProps {
  results: TicketWithMatches[];
  isLoading?: boolean;
  showDeveloperDetails?: boolean;
}

const MatchingResults: React.FC<MatchingResultsProps> = ({
  results,
  isLoading = false,
  showDeveloperDetails = true,
}) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Matching developers with tickets...</p>
        </div>
      </div>
    );
  }
  
  if (!results || results.length === 0) {
    return (
      <div className="w-full p-8 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No matching results</h3>
        <p className="text-sm text-muted-foreground mt-2">
          There are no open tickets available for matching or no developer profiles to match with.
        </p>
      </div>
    );
  }
  
  // Helper to get badge color based on priority level
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  // Helper to get match quality badge
  const getMatchQualityBadge = (score: number) => {
    if (score >= MATCH_SCORE_THRESHOLDS.EXCELLENT) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Excellent Match
        </Badge>
      );
    } else if (score >= MATCH_SCORE_THRESHOLDS.GOOD) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Good Match
        </Badge>
      );
    } else if (score >= MATCH_SCORE_THRESHOLDS.FAIR) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Fair Match
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Poor Match
        </Badge>
      );
    }
  };
  
  // Helper to get urgency icon
  const getUrgencyIcon = (urgency: string) => {
    switch(urgency) {
      case 'critical':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {results.map((result) => (
        <Card key={result.ticket.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {result.ticket.urgency && getUrgencyIcon(result.ticket.urgency)}
                  <Badge 
                    variant="outline" 
                    className={getPriorityBadgeColor(result.priorityLevel)}
                  >
                    {result.priorityLevel.toUpperCase()} Priority
                  </Badge>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                    Score: {result.priorityScore}
                  </span>
                </div>
                <CardTitle className="text-xl">{result.ticket.title}</CardTitle>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-1 text-xs"
                onClick={() => navigate(`/get-help/request/${result.ticket.id}`)}
              >
                View Details
              </Button>
            </div>
            <CardDescription className="line-clamp-2">{result.ticket.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <h4 className="text-sm font-medium mb-1">Technical Areas:</h4>
              <div className="flex flex-wrap gap-1">
                {result.ticket.technical_area?.map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            {showDeveloperDetails && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Best Developer Matches:</h4>
                {result.matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matching developers found</p>
                ) : (
                  <div className="space-y-3">
                    {result.matches.slice(0, 3).map((match, index) => (
                      <div 
                        key={match.developer.id} 
                        className={`p-3 rounded-md ${index === 0 ? 'bg-green-50 border border-green-100' : 'bg-muted/20'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={match.developer.image} alt={match.developer.name} />
                              <AvatarFallback>{match.developer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{match.developer.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Match Score: {match.matchScore}%
                              </div>
                            </div>
                          </div>
                          <div>
                            {getMatchQualityBadge(match.matchScore)}
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Why this match:</span> {match.matchReason.join(' • ')}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {match.developer.skills?.slice(0, 5).map((skill, i) => (
                                <Badge key={i} className="text-xs bg-primary/10 text-primary border-primary/20">
                                  {skill}
                                </Badge>
                              ))}
                              {match.developer.skills && match.developer.skills.length > 5 && (
                                <Badge className="text-xs bg-secondary text-muted-foreground">
                                  +{match.developer.skills.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {result.matches.length > 3 && (
                      <div className="text-xs text-center text-muted-foreground pt-1">
                        +{result.matches.length - 3} more potential matches
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-4 flex justify-end">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/get-help/request/${result.ticket.id}`)}
              >
                View Ticket
              </Button>
              {result.matches.length > 0 && (
                <Button 
                  size="sm"
                  onClick={() => {
                    // This would ideally trigger a request to match/assign
                    console.log('Assign ticket to developer:', result.matches[0].developer.id);
                  }}
                >
                  Match with Top Developer
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MatchingResults;
