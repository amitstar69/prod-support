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

// We'll keep Product type as a subset of Developer for backward compatibility
export interface Product extends Developer {
  price?: number; // Optional for backward compatibility
}
