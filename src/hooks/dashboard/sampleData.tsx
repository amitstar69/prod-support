
import { HelpRequest } from '../../types/helpRequest';

// Sample tickets to show for non-authenticated users
export const sampleTickets: HelpRequest[] = [
  {
    id: 'sample-1',
    client_id: 'demo-client',
    title: 'React Component Optimization',
    description: 'I have a React application with performance issues. Need help identifying and fixing components that are causing re-renders.',
    technical_area: ['Frontend', 'React', 'Performance Optimization'],
    urgency: 'medium',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 60,
    budget_range: '$50 - $100',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    code_snippet: 'function MyComponent() { const [state, setState] = useState(0); // More code here }'
  },
  {
    id: 'sample-2',
    client_id: 'demo-client',
    title: 'API Integration Help Needed',
    description: 'Need assistance integrating a third-party payment API into my Node.js backend. Documentation is confusing.',
    technical_area: ['Backend', 'API Integration', 'Node.js'],
    urgency: 'high',
    communication_preference: ['Chat', 'Voice Call'],
    estimated_duration: 90,
    budget_range: '$100 - $200',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: 'sample-3',
    client_id: 'demo-client',
    title: 'Database Query Optimization',
    description: 'PostgreSQL queries running slow in production. Need help optimizing and adding proper indexes.',
    technical_area: ['Database', 'SQL', 'Performance Optimization'],
    urgency: 'critical',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 120,
    budget_range: '$200 - $500',
    status: 'matching',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'sample-4',
    client_id: 'demo-client',
    title: 'Help with AWS Deployment',
    description: 'Need assistance setting up CI/CD pipeline for a React application on AWS. Having issues with S3 and CloudFront configuration.',
    technical_area: ['DevOps', 'AWS', 'CI/CD'],
    urgency: 'medium',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 150,
    budget_range: '$100 - $200',
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'sample-5',
    client_id: 'demo-client',
    title: 'React Native Animation Bug',
    description: 'Having issues with complex animations in a React Native app. Need help debugging and fixing jerky animations.',
    technical_area: ['Mobile Development', 'React Native', 'Animation'],
    urgency: 'high',
    communication_preference: ['Chat', 'Screen Sharing'],
    estimated_duration: 75,
    budget_range: '$50 - $100',
    status: 'pending',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  }
];
