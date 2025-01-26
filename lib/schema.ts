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
      exercises: {
        Row: {
          created_at: string | null
          description: string
          focus: string[]
          id: string
          is_two_sided: boolean
          lottie_file_url: string | null
          name: string
          skill_level: Database["public"]["Enums"]["experience_level_enum"]
          type: Database["public"]["Enums"]["exercise_type_enum"]
          updated_at: string | null
          voice_description_url: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          focus: string[]
          id?: string
          is_two_sided?: boolean
          lottie_file_url?: string | null
          name: string
          skill_level: Database["public"]["Enums"]["experience_level_enum"]
          type: Database["public"]["Enums"]["exercise_type_enum"]
          updated_at?: string | null
          voice_description_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          focus?: string[]
          id?: string
          is_two_sided?: boolean
          lottie_file_url?: string | null
          name?: string
          skill_level?: Database["public"]["Enums"]["experience_level_enum"]
          type?: Database["public"]["Enums"]["exercise_type_enum"]
          updated_at?: string | null
          voice_description_url?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          added_on: string
          created_at: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"]
          id: string
          mood_description: string | null
          picture_url: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          added_on?: string
          created_at?: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"]
          id?: string
          mood_description?: string | null
          picture_url?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          added_on?: string
          created_at?: string
          entry_type?: Database["public"]["Enums"]["entry_type_enum"]
          id?: string
          mood_description?: string | null
          picture_url?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_streak_levels"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          status: string
          updated_at: string
          used_by_user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          used_by_user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          used_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_used_by_user_id_fkey"
            columns: ["used_by_user_id"]
            isOneToOne: true
            referencedRelation: "user_streak_levels"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_codes_used_by_user_id_fkey"
            columns: ["used_by_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cooldown_exercise: string | null
          created_at: string | null
          focus: Database["public"]["Enums"]["session_focus_enum"]
          id: string
          is_custom: boolean
          notification_sent: boolean
          scheduled_date: string | null
          status: Database["public"]["Enums"]["session_status_enum"]
          target_exercises: string[] | null
          user_id: string
          warmup_exercise: string | null
        }
        Insert: {
          cooldown_exercise?: string | null
          created_at?: string | null
          focus: Database["public"]["Enums"]["session_focus_enum"]
          id?: string
          is_custom?: boolean
          notification_sent?: boolean
          scheduled_date?: string | null
          status: Database["public"]["Enums"]["session_status_enum"]
          target_exercises?: string[] | null
          user_id: string
          warmup_exercise?: string | null
        }
        Update: {
          cooldown_exercise?: string | null
          created_at?: string | null
          focus?: Database["public"]["Enums"]["session_focus_enum"]
          id?: string
          is_custom?: boolean
          notification_sent?: boolean
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["session_status_enum"]
          target_exercises?: string[] | null
          user_id?: string
          warmup_exercise?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_cooldown_exercise_fkey"
            columns: ["cooldown_exercise"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_cooldown_exercise_fkey"
            columns: ["cooldown_exercise"]
            isOneToOne: false
            referencedRelation: "random_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_streak_levels"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_warmup_exercise_fkey"
            columns: ["warmup_exercise"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_warmup_exercise_fkey"
            columns: ["warmup_exercise"]
            isOneToOne: false
            referencedRelation: "random_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_levels: {
        Row: {
          created_at: string | null
          emoji: string
          id: number
          name: string
          streak_count: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: number
          name: string
          streak_count: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: number
          name?: string
          streak_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_streak_levels"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          reminder_time: string
          session_duration: Database["public"]["Enums"]["session_duration_enum"]
          timezone: string
          tracking_method: Database["public"]["Enums"]["tracking_method_enum"]
          updated_at: string | null
          user_id: string
          weekly_sessions: Database["public"]["Enums"]["weekly_sessions_enum"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          reminder_time?: string
          session_duration: Database["public"]["Enums"]["session_duration_enum"]
          timezone?: string
          tracking_method: Database["public"]["Enums"]["tracking_method_enum"]
          updated_at?: string | null
          user_id: string
          weekly_sessions: Database["public"]["Enums"]["weekly_sessions_enum"]
        }
        Update: {
          created_at?: string | null
          id?: string
          reminder_time?: string
          session_duration?: Database["public"]["Enums"]["session_duration_enum"]
          timezone?: string
          tracking_method?: Database["public"]["Enums"]["tracking_method_enum"]
          updated_at?: string | null
          user_id?: string
          weekly_sessions?: Database["public"]["Enums"]["weekly_sessions_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_streak_levels"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          current_streak: number
          email: string | null
          experience_level: Database["public"]["Enums"]["experience_level_enum"]
          id: string
          last_checkin_date: string | null
          longest_streak: number
          phone_number: string | null
          push_token: string | null
          referral_code_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          email?: string | null
          experience_level: Database["public"]["Enums"]["experience_level_enum"]
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          phone_number?: string | null
          push_token?: string | null
          referral_code_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          email?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level_enum"]
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          phone_number?: string | null
          push_token?: string | null
          referral_code_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      exercises_focus: {
        Row: {
          unnest: string | null
        }
        Relationships: []
      }
      random_exercises: {
        Row: {
          created_at: string | null
          description: string | null
          focus: string[] | null
          id: string | null
          is_two_sided: boolean | null
          lottie_file_url: string | null
          name: string | null
          skill_level:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          type: Database["public"]["Enums"]["exercise_type_enum"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          focus?: string[] | null
          id?: string | null
          is_two_sided?: boolean | null
          lottie_file_url?: string | null
          name?: string | null
          skill_level?:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          type?: Database["public"]["Enums"]["exercise_type_enum"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          focus?: string[] | null
          id?: string | null
          is_two_sided?: boolean | null
          lottie_file_url?: string | null
          name?: string | null
          skill_level?:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          type?: Database["public"]["Enums"]["exercise_type_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_streak_levels: {
        Row: {
          daily_streak: number | null
          streak_level_emoji: string | null
          streak_level_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      weekly_sessions: {
        Row: {
          completed_sessions: number | null
          sessions: Json[] | null
          total_sessions: number | null
          user_id: string | null
          week_end: string | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_streak_levels"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_referral_code: {
        Args: {
          p_code: string
        }
        Returns: boolean
      }
      claim_referral_code: {
        Args: {
          p_code: string
          p_user_id: string
        }
        Returns: boolean
      }
      save_onboarding_data: {
        Args: {
          p_user_id: string
          p_phone_number: string
          p_email: string
          p_experience_level: string
          p_push_token: string
          p_goals: string[]
          p_weekly_sessions: string
          p_session_duration: string
          p_tracking_method: string
          p_reminder_time: string
          p_timezone: string
        }
        Returns: undefined
      }
    }
    Enums: {
      entry_type_enum: "session" | "picture" | "mood"
      exercise_type_enum: "warmup" | "target" | "cooldown"
      experience_level_enum: "beginner" | "intermediate" | "advanced"
      session_duration_enum:
        | "5-10"
        | "10-20"
        | "30-45"
        | "60-75"
        | "10"
        | "15"
        | "20"
        | "30"
      session_focus_enum: "full body" | "upper body" | "lower body" | "core"
      session_status_enum: "scheduled" | "completed" | "skipped"
      tracking_method_enum: "pictures" | "mood" | "neither"
      weekly_sessions_enum: "3" | "5" | "everyday"
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
