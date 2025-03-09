
export interface Profile {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  image?: string;
  bio?: string;
  technical_skills?: string[];
  profile_type: 'client' | 'developer';
  hourly_rate?: number;
  years_experience?: number;
  created_at: string;
  updated_at: string;
}
