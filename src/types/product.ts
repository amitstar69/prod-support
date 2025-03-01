
export interface Developer {
  id: string;
  name: string;
  hourlyRate: number;
  image: string;
  category: string;
  skills: string[];
  experience: string;
  description: string;
  rating: number;
  availability: boolean;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

// Changed to make Product and Developer separate types that share common properties
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  featured?: boolean;
  // These fields are only for developers and are optional for backward compatibility
  hourlyRate?: number;
  skills?: string[];
  experience?: string;
  availability?: boolean;
}
