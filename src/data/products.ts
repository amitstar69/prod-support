import { Product } from '../types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'Experience music like never before with these premium wireless headphones featuring active noise cancellation and an immersive sound profile.',
    rating: 4.8,
    featured: true,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '2',
    name: 'Minimalist Analog Watch',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
    category: 'accessories',
    description: 'A timeless analog watch with a clean minimalist design. Features a premium leather strap and precision Japanese movement.',
    rating: 4.7,
    featured: true,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '3',
    name: 'Smart Home Assistant',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc054?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'Control your entire home with simple voice commands. Features seamless integration with all popular smart home devices.',
    rating: 4.5,
    featured: true,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '4',
    name: 'Leather Laptop Sleeve',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop',
    category: 'accessories',
    description: 'Protect your laptop in style with this premium genuine leather laptop sleeve with soft microfiber interior.',
    rating: 4.6,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '5',
    name: 'Fitness Smart Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1600&auto=format&fit=crop',
    category: 'wearables',
    description: 'Track your health and fitness goals with precision. Features heart rate monitoring, GPS, and 7-day battery life.',
    rating: 4.4,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '6',
    name: 'Bluetooth Portable Speaker',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'A portable Bluetooth speaker with rich, room-filling sound and 20 hours of playback on a single charge.',
    rating: 4.3,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '7',
    name: 'Ultra-thin Smartphone Case',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1541357220468-f8706faa9375?q=80&w=1600&auto=format&fit=crop',
    category: 'accessories',
    description: 'Protect your smartphone without adding bulk. This ultra-thin case provides drop protection while maintaining the sleek design of your device.',
    rating: 4.5,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  },
  {
    id: '8',
    name: 'Noise-Cancelling Earbuds',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'True wireless earbuds with advanced noise cancellation technology and exceptional audio quality for immersive listening.',
    rating: 4.7,
    hourlyRate: 0,
    skills: [],
    experience: '',
    availability: false
  }
];

export const developers = [
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
  }
];

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
  return products.filter(product => product.featured);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const searchDevelopers = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return developers.filter(
    dev =>
      dev.name.toLowerCase().includes(lowercaseQuery) ||
      dev.description.toLowerCase().includes(lowercaseQuery) ||
      dev.category.toLowerCase().includes(lowercaseQuery) ||
      dev.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
  );
};
