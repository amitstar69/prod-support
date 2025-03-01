
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

export interface Product extends Developer {
  price: number; // Keep for backward compatibility
}
