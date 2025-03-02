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
  minuteRate?: number;  // New field for per-minute billing
  online?: boolean;     // New field to show current online status
  lastActive?: string;  // New field to show when the developer was last active
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

// We'll keep Product type as an alias to Developer for backward compatibility
// This will help us avoid breaking changes in components that use Product
export type Product = Developer;
