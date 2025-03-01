
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}
