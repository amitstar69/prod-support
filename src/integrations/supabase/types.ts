export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          budget: number | null
          budget_per_hour: number | null
          communication_preferences: string[] | null
          company: string | null
          completed_projects: number | null
          id: string
          industry: string | null
          looking_for: string[] | null
          payment_method: string | null
          position: string | null
          preferred_help_format: string[] | null
          profile_completion_percentage: number | null
          project_types: string[] | null
          social_links: Json | null
          tech_stack: string[] | null
          time_zone: string | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          budget?: number | null
          budget_per_hour?: number | null
          communication_preferences?: string[] | null
          company?: string | null
          completed_projects?: number | null
          id: string
          industry?: string | null
          looking_for?: string[] | null
          payment_method?: string | null
          position?: string | null
          preferred_help_format?: string[] | null
          profile_completion_percentage?: number | null
          project_types?: string[] | null
          social_links?: Json | null
          tech_stack?: string[] | null
          time_zone?: string | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          budget?: number | null
          budget_per_hour?: number | null
          communication_preferences?: string[] | null
          company?: string | null
          completed_projects?: number | null
          id?: string
          industry?: string | null
          looking_for?: string[] | null
          payment_method?: string | null
          position?: string | null
          preferred_help_format?: string[] | null
          profile_completion_percentage?: number | null
          project_types?: string[] | null
          social_links?: Json | null
          tech_stack?: string[] | null
          time_zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_profiles: {
        Row: {
          availability: boolean | null
          category: string | null
          communication_preferences: string[] | null
          experience: string | null
          featured: boolean | null
          hourly_rate: number | null
          id: string
          last_active: string | null
          minute_rate: number | null
          online: boolean | null
          phone: string | null
          rating: number | null
          skills: string[] | null
        }
        Insert: {
          availability?: boolean | null
          category?: string | null
          communication_preferences?: string[] | null
          experience?: string | null
          featured?: boolean | null
          hourly_rate?: number | null
          id: string
          last_active?: string | null
          minute_rate?: number | null
          online?: boolean | null
          phone?: string | null
          rating?: number | null
          skills?: string[] | null
        }
        Update: {
          availability?: boolean | null
          category?: string | null
          communication_preferences?: string[] | null
          experience?: string | null
          featured?: boolean | null
          hourly_rate?: number | null
          id?: string
          last_active?: string | null
          minute_rate?: number | null
          online?: boolean | null
          phone?: string | null
          rating?: number | null
          skills?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          description: string | null
          email: string
          id: string
          image: string | null
          joined_date: string | null
          languages: string[] | null
          location: string | null
          name: string
          preferred_working_hours: string | null
          profile_completed: boolean | null
          user_type: string
          username: string | null
        }
        Insert: {
          description?: string | null
          email: string
          id: string
          image?: string | null
          joined_date?: string | null
          languages?: string[] | null
          location?: string | null
          name: string
          preferred_working_hours?: string | null
          profile_completed?: boolean | null
          user_type: string
          username?: string | null
        }
        Update: {
          description?: string | null
          email?: string
          id?: string
          image?: string | null
          joined_date?: string | null
          languages?: string[] | null
          location?: string | null
          name?: string
          preferred_working_hours?: string | null
          profile_completed?: boolean | null
          user_type?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
