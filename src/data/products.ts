
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
    featured: true
  },
  {
    id: '2',
    name: 'Minimalist Analog Watch',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
    category: 'accessories',
    description: 'A timeless analog watch with a clean minimalist design. Features a premium leather strap and precision Japanese movement.',
    rating: 4.7,
    featured: true
  },
  {
    id: '3',
    name: 'Smart Home Assistant',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc054?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'Control your entire home with simple voice commands. Features seamless integration with all popular smart home devices.',
    rating: 4.5,
    featured: true
  },
  {
    id: '4',
    name: 'Leather Laptop Sleeve',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop',
    category: 'accessories',
    description: 'Protect your laptop in style with this premium genuine leather laptop sleeve with soft microfiber interior.',
    rating: 4.6
  },
  {
    id: '5',
    name: 'Fitness Smart Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1600&auto=format&fit=crop',
    category: 'wearables',
    description: 'Track your health and fitness goals with precision. Features heart rate monitoring, GPS, and 7-day battery life.',
    rating: 4.4
  },
  {
    id: '6',
    name: 'Bluetooth Portable Speaker',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'A portable Bluetooth speaker with rich, room-filling sound and 20 hours of playback on a single charge.',
    rating: 4.3
  },
  {
    id: '7',
    name: 'Ultra-thin Smartphone Case',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1541357220468-f8706faa9375?q=80&w=1600&auto=format&fit=crop',
    category: 'accessories',
    description: 'Protect your smartphone without adding bulk. This ultra-thin case provides drop protection while maintaining the sleek design of your device.',
    rating: 4.5
  },
  {
    id: '8',
    name: 'Noise-Cancelling Earbuds',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1600&auto=format&fit=crop',
    category: 'electronics',
    description: 'True wireless earbuds with advanced noise cancellation technology and exceptional audio quality for immersive listening.',
    rating: 4.7
  }
];

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
