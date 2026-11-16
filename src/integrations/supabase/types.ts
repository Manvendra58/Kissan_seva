export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      crops: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          fertilizers: string | null
          id: string
          image_url: string | null
          modern_techniques: string | null
          name: string
          organic_methods: string | null
          pesticides: string | null
          season: string | null
          soil_preparation: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          fertilizers?: string | null
          id?: string
          image_url?: string | null
          modern_techniques?: string | null
          name: string
          organic_methods?: string | null
          pesticides?: string | null
          season?: string | null
          soil_preparation?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          fertilizers?: string | null
          id?: string
          image_url?: string | null
          modern_techniques?: string | null
          name?: string
          organic_methods?: string | null
          pesticides?: string | null
          season?: string | null
          soil_preparation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      farmer_queries: {
        Row: {
          admin_response: string | null
          category: string | null
          created_at: string
          id: string
          message: string
          responded_at: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message: string
          responded_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          responded_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          crop_name: string
          district: string | null
          id: string
          market_name: string | null
          price_date: string
          price_per_quintal: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          district?: string | null
          id?: string
          market_name?: string | null
          price_date?: string
          price_per_quintal?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          district?: string | null
          id?: string
          market_name?: string | null
          price_date?: string
          price_per_quintal?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          message: string
          notification_type: string | null
          target_crops: string[] | null
          target_states: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          message: string
          notification_type?: string | null
          target_crops?: string[] | null
          target_states?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          message?: string
          notification_type?: string | null
          target_crops?: string[] | null
          target_states?: string[] | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          crop_type: string | null
          district: string | null
          email: string | null
          full_name: string
          id: string
          mobile: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_type?: string | null
          district?: string | null
          email?: string | null
          full_name: string
          id?: string
          mobile?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop_type?: string | null
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          mobile?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schemes: {
        Row: {
          application_process: string | null
          benefits: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligibility: string | null
          id: string
          is_active: boolean | null
          name: string
          pdf_url: string | null
          updated_at: string
        }
        Insert: {
          application_process?: string | null
          benefits?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          application_process?: string | null
          benefits?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pdf_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seasonal_calendar: {
        Row: {
          activity: string
          created_at: string
          crop_name: string
          id: string
          month: number
          tips: string | null
        }
        Insert: {
          activity: string
          created_at?: string
          crop_name: string
          id?: string
          month: number
          tips?: string | null
        }
        Update: {
          activity?: string
          created_at?: string
          crop_name?: string
          id?: string
          month?: number
          tips?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_updates: {
        Row: {
          alert_message: string | null
          alert_type: string | null
          created_at: string
          district: string | null
          forecast_date: string
          humidity: number | null
          id: string
          rainfall_probability: number | null
          state: string | null
          temperature: number | null
          weather_condition: string | null
        }
        Insert: {
          alert_message?: string | null
          alert_type?: string | null
          created_at?: string
          district?: string | null
          forecast_date?: string
          humidity?: number | null
          id?: string
          rainfall_probability?: number | null
          state?: string | null
          temperature?: number | null
          weather_condition?: string | null
        }
        Update: {
          alert_message?: string | null
          alert_type?: string | null
          created_at?: string
          district?: string | null
          forecast_date?: string
          humidity?: number | null
          id?: string
          rainfall_probability?: number | null
          state?: string | null
          temperature?: number | null
          weather_condition?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "farmer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "farmer"],
    },
  },
} as const
