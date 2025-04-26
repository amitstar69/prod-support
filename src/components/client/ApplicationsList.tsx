
import { HelpRequestMatch } from '../../hooks/useTicketApplications';
import ApplicationCard from './ApplicationCard';

interface ApplicationsListProps {
  applications: HelpRequestMatch[];
}

const ApplicationsList = ({ applications }: ApplicationsListProps) => {
  if (!applications.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No applications yet. Please check back soon.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {applications.map((application) => (
        <ApplicationCard 
          key={application.id} 
          application={application}
        />
      ))}
    </div>
  );
};

export default ApplicationsList;
