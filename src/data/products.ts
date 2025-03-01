import { Developer, Product } from '../types/product';

export const developers: Developer[] = [
  {
    id: 'dev1',
    name: 'Alex Johnson',
    hourlyRate: 85,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1600&auto=format&fit=crop',
    category: 'frontend',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    experience: '5+ years in frontend development',
    description: 'Frontend specialist with expertise in building responsive and accessible web applications.',
    rating: 4.9,
    availability: true,
    featured: true
  },
  {
    id: 'dev2',
    name: 'Samantha Chen',
    hourlyRate: 95,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1600&auto=format&fit=crop',
    category: 'backend',
    skills: ['Node.js', 'Python', 'AWS', 'PostgreSQL'],
    experience: '7+ years in backend development',
    description: 'Backend engineer experienced in building scalable APIs and cloud architecture.',
    rating: 4.8,
    availability: true,
    featured: true
  },
  {
    id: 'dev3',
    name: 'Marcus Williams',
    hourlyRate: 110,
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1600&auto=format&fit=crop',
    category: 'fullstack',
    skills: ['JavaScript', 'Python', 'React', 'Django', 'Docker'],
    experience: '8+ years in full stack development',
    description: 'Versatile developer who can handle everything from database design to frontend implementation.',
    rating: 4.9,
    availability: true,
    featured: true
  },
  {
    id: 'dev4',
    name: 'Elena Rivera',
    hourlyRate: 90,
    image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1600&auto=format&fit=crop',
    category: 'mobile',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
    experience: '6+ years in mobile app development',
    description: 'Mobile developer specialized in cross-platform and native app development.',
    rating: 4.7,
    availability: true,
    featured: false
  },
  {
    id: 'dev5',
    name: 'David Kim',
    hourlyRate: 100,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop',
    category: 'devops',
    skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Terraform'],
    experience: '8+ years in DevOps and cloud infrastructure',
    description: 'DevOps engineer with extensive experience in cloud infrastructure and automation.',
    rating: 4.8,
    availability: true,
    featured: false
  },
  {
    id: 'dev6',
    name: 'Olivia Torres',
    hourlyRate: 120,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop',
    category: 'security',
    skills: ['Penetration Testing', 'Security Audits', 'OWASP', 'Encryption'],
    experience: '10+ years in cybersecurity',
    description: 'Security specialist focused on web application security and compliance.',
    rating: 4.9,
    availability: false,
    featured: false
  },
  {
    id: 'dev7',
    name: 'Michael Zhang',
    hourlyRate: 85,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1600&auto=format&fit=crop',
    category: 'database',
    skills: ['SQL', 'MongoDB', 'Firebase', 'Redis', 'Data Modeling'],
    experience: '7+ years in database design and optimization',
    description: 'Database specialist with expertise in both SQL and NoSQL databases.',
    rating: 4.6,
    availability: true,
    featured: false
  },
  {
    id: 'dev8',
    name: 'Sophie Anderson',
    hourlyRate: 95,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1600&auto=format&fit=crop',
    category: 'ai',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'NLP'],
    experience: '5+ years in AI and machine learning',
    description: 'AI developer with experience in natural language processing and predictive modeling.',
    rating: 4.7,
    availability: true,
    featured: false
  }
];

export const products: Product[] = developers;

export const getDevelopers = () => {
  return developers;
};

export const getFeaturedDevelopers = () => {
  return developers.filter(dev => dev.featured);
};

export const getDeveloperById = (id: string) => {
  return developers.find(dev => dev.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return developers.filter(dev => dev.featured);
};

export const getProductById = (id: string): Product | undefined => {
  return developers.find(dev => dev.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return developers.filter(dev => dev.category === category);
};

export const searchProducts = (query: string): Product[] => {
  return searchDevelopers(query);
};

export const searchDevelopers = (query: string): Developer[] => {
  const lowercaseQuery = query.toLowerCase();
  return developers.filter(
    dev =>
      dev.name.toLowerCase().includes(lowercaseQuery) ||
      dev.description.toLowerCase().includes(lowercaseQuery) ||
      dev.category.toLowerCase().includes(lowercaseQuery) ||
      dev.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
  );
};
