
import { Category } from '../types/product';

export const categories: Category[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'backend',
    name: 'Backend Development',
    image: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'fullstack',
    name: 'Full-Stack Development',
    image: 'https://images.unsplash.com/photo-1629904853716-f0bc54eea481?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    image: 'https://images.unsplash.com/photo-1596742578443-7682ef5251cd?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1600&auto=format&fit=crop'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};
