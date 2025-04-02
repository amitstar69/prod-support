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
      chat_messages: {
        Row: {
          created_at: string
          help_request_id: string
          id: string
          is_read: boolean
          message: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          help_request_id: string
          id?: string
          is_read?: boolean
          message: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          help_request_id?: string
          id?: string
          is_read?: boolean
          message?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_help_request_id_fkey"
            columns: ["help_request_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
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
          certifications: Json | null
          communication_preferences: string[] | null
          education: Json | null
          experience: string | null
          featured: boolean | null
          hourly_rate: number | null
          id: string
          languages_spoken: Json | null
          last_active: string | null
          minute_rate: number | null
          online: boolean | null
          phone: string | null
          portfolio_items: Json | null
          rating: number | null
          skills: string[] | null
        }
        Insert: {
          availability?: boolean | null
          category?: string | null
          certifications?: Json | null
          communication_preferences?: string[] | null
          education?: Json | null
          experience?: string | null
          featured?: boolean | null
          hourly_rate?: number | null
          id: string
          languages_spoken?: Json | null
          last_active?: string | null
          minute_rate?: number | null
          online?: boolean | null
          phone?: string | null
          portfolio_items?: Json | null
          rating?: number | null
          skills?: string[] | null
        }
        Update: {
          availability?: boolean | null
          category?: string | null
          certifications?: Json | null
          communication_preferences?: string[] | null
          education?: Json | null
          experience?: string | null
          featured?: boolean | null
          hourly_rate?: number | null
          id?: string
          languages_spoken?: Json | null
          last_active?: string | null
          minute_rate?: number | null
          online?: boolean | null
          phone?: string | null
          portfolio_items?: Json | null
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
      help_request_history: {
        Row: {
          change_details: Json
          change_type: string
          changed_at: string
          changed_by: string
          help_request_id: string
          id: string
          new_status: string | null
          previous_status: string | null
        }
        Insert: {
          change_details?: Json
          change_type: string
          changed_at?: string
          changed_by: string
          help_request_id: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Update: {
          change_details?: Json
          change_type?: string
          changed_at?: string
          changed_by?: string
          help_request_id?: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_request_history_help_request_id_fkey"
            columns: ["help_request_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      help_request_matches: {
        Row: {
          created_at: string
          developer_id: string
          id: string
          match_score: number | null
          proposed_duration: number | null
          proposed_message: string | null
          proposed_rate: number | null
          request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          developer_id: string
          id?: string
          match_score?: number | null
          proposed_duration?: number | null
          proposed_message?: string | null
          proposed_rate?: number | null
          request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          developer_id?: string
          id?: string
          match_score?: number | null
          proposed_duration?: number | null
          proposed_message?: string | null
          proposed_rate?: number | null
          request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_request_matches_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_request_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          attachments: Json | null
          budget_range: string
          cancellation_reason: string | null
          client_id: string
          code_snippet: string | null
          communication_preference: string[]
          complexity_level: string | null
          created_at: string
          description: string
          estimated_duration: number
          id: string
          nda_required: boolean | null
          preferred_developer_experience: string | null
          preferred_developer_location: string | null
          status: string
          technical_area: string[]
          ticket_number: number
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          attachments?: Json | null
          budget_range: string
          cancellation_reason?: string | null
          client_id: string
          code_snippet?: string | null
          communication_preference: string[]
          complexity_level?: string | null
          created_at?: string
          description: string
          estimated_duration: number
          id?: string
          nda_required?: boolean | null
          preferred_developer_experience?: string | null
          preferred_developer_location?: string | null
          status?: string
          technical_area: string[]
          ticket_number?: never
          title: string
          updated_at?: string
          urgency: string
        }
        Update: {
          attachments?: Json | null
          budget_range?: string
          cancellation_reason?: string | null
          client_id?: string
          code_snippet?: string | null
          communication_preference?: string[]
          complexity_level?: string | null
          created_at?: string
          description?: string
          estimated_duration?: number
          id?: string
          nda_required?: boolean | null
          preferred_developer_experience?: string | null
          preferred_developer_location?: string | null
          status?: string
          technical_area?: string[]
          ticket_number?: never
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_sessions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          client_id: string
          created_at: string
          developer_id: string
          final_cost: number | null
          id: string
          request_id: string
          scheduled_end: string | null
          scheduled_start: string | null
          shared_code: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          client_id: string
          created_at?: string
          developer_id: string
          final_cost?: number | null
          id?: string
          request_id: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          shared_code?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          client_id?: string
          created_at?: string
          developer_id?: string
          final_cost?: number | null
          id?: string
          request_id?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          shared_code?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_sessions_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_sessions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_type: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          completed_first_session: boolean | null
          description: string | null
          email: string
          has_zoom: boolean | null
          id: string
          image: string | null
          joined_date: string | null
          languages: string[] | null
          location: string | null
          name: string
          onboarding_completed: boolean | null
          payment_method_added: boolean | null
          preferred_working_hours: string | null
          profile_completed: boolean | null
          user_type: string
          username: string | null
        }
        Insert: {
          completed_first_session?: boolean | null
          description?: string | null
          email: string
          has_zoom?: boolean | null
          id: string
          image?: string | null
          joined_date?: string | null
          languages?: string[] | null
          location?: string | null
          name: string
          onboarding_completed?: boolean | null
          payment_method_added?: boolean | null
          preferred_working_hours?: string | null
          profile_completed?: boolean | null
          user_type: string
          username?: string | null
        }
        Update: {
          completed_first_session?: boolean | null
          description?: string | null
          email?: string
          has_zoom?: boolean | null
          id?: string
          image?: string | null
          joined_date?: string | null
          languages?: string[] | null
          location?: string | null
          name?: string
          onboarding_completed?: boolean | null
          payment_method_added?: boolean | null
          preferred_working_hours?: string | null
          profile_completed?: boolean | null
          user_type?: string
          username?: string | null
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_code: boolean | null
          sender_id: string
          sender_type: string
          session_id: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_code?: boolean | null
          sender_id: string
          sender_type: string
          session_id: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_code?: boolean | null
          sender_id?: string
          sender_type?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "help_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_summaries: {
        Row: {
          client_id: string
          client_name: string
          cost: number | null
          created_at: string
          developer_id: string
          developer_name: string
          duration: number
          feedback: string | null
          id: string
          rating: number | null
          session_id: string
          solution: string | null
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_name: string
          cost?: number | null
          created_at?: string
          developer_id: string
          developer_name: string
          duration: number
          feedback?: string | null
          id?: string
          rating?: number | null
          session_id: string
          solution?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_name?: string
          cost?: number | null
          created_at?: string
          developer_id?: string
          developer_name?: string
          duration?: number
          feedback?: string | null
          id?: string
          rating?: number | null
          session_id?: string
          solution?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_summaries_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "help_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_table_info: {
        Args: {
          table_name: string
        }
        Returns: Json
      }
      is_owner_of_help_request: {
        Args: {
          record_id: string
        }
        Returns: boolean
      }
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
