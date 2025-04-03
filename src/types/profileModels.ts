
export interface ClientProfile {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  user_type?: string;
  company?: string;
  position?: string;
  location?: string;
  description?: string;
  technical_interests?: string[];
  created_at?: string;
  updated_at?: string;
  has_zoom?: boolean;
  completed_first_session?: boolean;
  payment_method_added?: boolean;
}

export interface DeveloperProfile {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  user_type?: string;
  title?: string;
  skills?: string[];
  hourly_rate?: number;
  experience_years?: number;
  created_at?: string;
  updated_at?: string;
  rating?: number;
  availability?: boolean;
  bio?: string;
}
