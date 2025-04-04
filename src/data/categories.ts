
import { Category } from '../types/product';

export const categories: Category[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'backend',
    name: 'Backend Development',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'fullstack',
    name: 'Full Stack Development',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'ai',
    name: 'AI & Machine Learning',
    image: 'https://images.unsplash.com/photo-1677442135145-9cb3f5800000?q=80&w=1600&auto=format&fit=crop'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};
