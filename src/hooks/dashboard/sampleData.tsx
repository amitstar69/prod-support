
import { HelpRequest } from '../../types/helpRequest';

export const sampleTickets: HelpRequest[] = [
  {
    id: '1',
    client_id: 'sample-client-1',
    title: 'Help with React Component Optimization',
    description: 'I have a React application with performance issues. Need help optimizing renders and managing state properly.',
    technical_area: ['Frontend', 'Performance Optimization'],
    urgency: 'medium',
    communication_preference: ['Chat', 'Video Call'],
    estimated_duration: 60,
    budget_range: '$50 - $100',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    code_snippet: 'function MyComponent() { const [state, setState] = useState([]); // More code here... }'
  },
  {
    id: '2',
    client_id: 'sample-client-2',
    title: 'Database Query Optimization',
    description: 'Our PostgreSQL queries are slow. Need help optimizing them and implementing proper indexes.',
    technical_area: ['Database', 'Backend', 'Performance Optimization'],
    urgency: 'high',
    communication_preference: ['Chat', 'Screen Sharing'],
    estimated_duration: 90,
    budget_range: '$100 - $200',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: '3',
    client_id: 'sample-client-3',
    title: 'AWS Lambda Function Debugging',
    description: 'Our serverless function is failing in production but works in development. Need help diagnosing and fixing the issue.',
    technical_area: ['Cloud Services', 'DevOps', 'Backend'],
    urgency: 'urgent',
    communication_preference: ['Chat', 'Screen Sharing', 'Voice Call'],
    estimated_duration: 120,
    budget_range: '$100 - $200',
    status: 'matching',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: '4',
    client_id: 'sample-client-4',
    title: 'Mobile App UI Bug Fixes',
    description: 'Several UI issues in our React Native app on different screen sizes. Need help making the interface responsive.',
    technical_area: ['Mobile Development', 'UI/UX', 'Frontend'],
    urgency: 'medium',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 180,
    budget_range: '$200 - $500',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: '5',
    client_id: 'sample-client-5',
    title: 'API Integration Assistance',
    description: 'Need help integrating Stripe payment processing API into our Node.js backend.',
    technical_area: ['API Integration', 'Backend'],
    urgency: 'medium',
    communication_preference: ['Chat', 'Code Review'],
    estimated_duration: 120,
    budget_range: '$100 - $200',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  }
];
