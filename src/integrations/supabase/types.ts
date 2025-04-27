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
      developer_application_counts: {
        Row: {
          created_at: string | null
          developer_id: string | null
          id: string
          last_application_date: string | null
          total_applications: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          developer_id?: string | null
          id?: string
          last_application_date?: string | null
          total_applications?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          developer_id?: string | null
          id?: string
          last_application_date?: string | null
          total_applications?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      developer_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          developer_id: string
          id: string
          payment_intent_id: string | null
          payment_status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          developer_id: string
          id?: string
          payment_intent_id?: string | null
          payment_status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          developer_id?: string
          id?: string
          payment_intent_id?: string | null
          payment_status?: string
          updated_at?: string
        }
        Relationships: []
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
          free_applications_remaining: number | null
          hourly_rate: number | null
          id: string
          is_paid_developer: boolean | null
          languages_spoken: Json | null
          last_active: string | null
          minute_rate: number | null
          online: boolean | null
          payment_completed_at: string | null
          phone: string | null
          portfolio_items: Json | null
          premium_verified: boolean | null
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
          free_applications_remaining?: number | null
          hourly_rate?: number | null
          id: string
          is_paid_developer?: boolean | null
          languages_spoken?: Json | null
          last_active?: string | null
          minute_rate?: number | null
          online?: boolean | null
          payment_completed_at?: string | null
          phone?: string | null
          portfolio_items?: Json | null
          premium_verified?: boolean | null
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
          free_applications_remaining?: number | null
          hourly_rate?: number | null
          id?: string
          is_paid_developer?: boolean | null
          languages_spoken?: Json | null
          last_active?: string | null
          minute_rate?: number | null
          online?: boolean | null
          payment_completed_at?: string | null
          phone?: string | null
          portfolio_items?: Json | null
          premium_verified?: boolean | null
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
          client_feedback: string | null
          client_id: string
          client_review_complete_time: string | null
          client_review_start_time: string | null
          code_snippet: string | null
          communication_preference: string[]
          complexity_level: string | null
          created_at: string
          description: string
          developer_qa_notes: string | null
          estimated_duration: number
          id: string
          nda_required: boolean | null
          preferred_developer_experience: string | null
          preferred_developer_location: string | null
          qa_complete_time: string | null
          qa_start_time: string | null
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
          client_feedback?: string | null
          client_id: string
          client_review_complete_time?: string | null
          client_review_start_time?: string | null
          code_snippet?: string | null
          communication_preference: string[]
          complexity_level?: string | null
          created_at?: string
          description: string
          developer_qa_notes?: string | null
          estimated_duration: number
          id?: string
          nda_required?: boolean | null
          preferred_developer_experience?: string | null
          preferred_developer_location?: string | null
          qa_complete_time?: string | null
          qa_start_time?: string | null
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
          client_feedback?: string | null
          client_id?: string
          client_review_complete_time?: string | null
          client_review_start_time?: string | null
          code_snippet?: string | null
          communication_preference?: string[]
          complexity_level?: string | null
          created_at?: string
          description?: string
          developer_qa_notes?: string | null
          estimated_duration?: number
          id?: string
          nda_required?: boolean | null
          preferred_developer_experience?: string | null
          preferred_developer_location?: string | null
          qa_complete_time?: string | null
          qa_start_time?: string | null
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
          action_data: Json | null
          created_at: string
          entity_type: string
          id: string
          is_read: boolean
          message: string
          notification_type: string | null
          related_entity_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          created_at?: string
          entity_type: string
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string | null
          related_entity_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          created_at?: string
          entity_type?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string | null
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
      ticket_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ticket_comments_ticket"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ticket_comments_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_history: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          new_value: string | null
          previous_value: string | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          previous_value?: string | null
          ticket_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          previous_value?: string | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ticket_history_ticket"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ticket_history_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Args: { table_name: string }
        Returns: Json
      }
      is_owner_of_help_request: {
        Args: { record_id: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
