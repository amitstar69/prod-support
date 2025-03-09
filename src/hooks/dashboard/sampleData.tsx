
import { HelpRequest } from '../../types/helpRequest';
import { Developer } from '../../types/product';

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

// Sample developers data for testing
export const sampleDevelopers: Developer[] = [
  {
    id: 'dev-1',
    name: 'Alex Johnson',
    hourlyRate: 75,
    minuteRate: 1.25,
    image: '/placeholder.svg',
    category: 'Frontend',
    skills: ['React', 'JavaScript', 'CSS', 'Performance Optimization'],
    experience: '5 years',
    description: 'Frontend specialist with focus on React and performance optimization',
    rating: 4.8,
    availability: true,
    online: true,
    username: 'alexj',
    location: 'San Francisco, CA',
    featured: true,
    lastActive: new Date().toISOString(),
    communicationPreferences: ['Video Call', 'Screen Sharing']
  },
  {
    id: 'dev-2',
    name: 'Sarah Miller',
    hourlyRate: 90,
    minuteRate: 1.5,
    image: '/placeholder.svg',
    category: 'Backend',
    skills: ['Node.js', 'Express', 'API Integration', 'Database'],
    experience: '7 years',
    description: 'Backend developer specialized in API integrations and database optimization',
    rating: 4.9,
    availability: true,
    online: false,
    username: 'sarahm',
    location: 'Boston, MA',
    featured: false,
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    communicationPreferences: ['Chat', 'Voice Call']
  },
  {
    id: 'dev-3',
    name: 'Michael Chen',
    hourlyRate: 120,
    minuteRate: 2,
    image: '/placeholder.svg',
    category: 'Database',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL Optimization'],
    experience: '10 years',
    description: 'Database expert specializing in SQL optimization and performance tuning',
    rating: 5.0,
    availability: false,
    online: false,
    username: 'michaelc',
    location: 'New York, NY',
    featured: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    communicationPreferences: ['Video Call', 'Screen Sharing']
  }
];

// Function to generate sample data for developer dashboard
export const generateSampleDeveloperDashboardData = () => {
  return {
    tickets: sampleTickets,
    developers: sampleDevelopers
  };
};
