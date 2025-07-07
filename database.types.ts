export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          category_id: number
          name: Database["public"]["Enums"]["product_category"]
        }
        Insert: {
          category_id?: never
          name: Database["public"]["Enums"]["product_category"]
        }
        Update: {
          category_id?: never
          name?: Database["public"]["Enums"]["product_category"]
        }
        Relationships: []
      }
      give_and_glow_reviews: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          giver_id: string
          id: number
          product_id: number | null
          rating: number
          receiver_id: string
          tags: Json
          timestamp: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          giver_id: string
          id?: never
          product_id?: number | null
          rating: number
          receiver_id: string
          tags?: Json
          timestamp: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          giver_id?: string
          id?: never
          product_id?: number | null
          rating?: number
          receiver_id?: string
          tags?: Json
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      item_analyses: {
        Row: {
          ai_listing_description: string | null
          ai_listing_location: string | null
          ai_listing_price: number | null
          ai_listing_title: string | null
          ai_suggestion: string
          analysis_id: string
          co2_impact: number
          created_at: string
          current_value: number | null
          emotional_score: number
          environmental_impact: Database["public"]["Enums"]["environmental_impact_level"]
          images: Json
          is_recyclable: boolean
          item_category: Database["public"]["Enums"]["product_category"]
          item_condition: Database["public"]["Enums"]["product_condition"]
          item_name: string
          landfill_impact: string
          maintenance_cost: number | null
          original_price: number | null
          recommendation: Database["public"]["Enums"]["recommendation_action"]
          session_id: number
          space_value: number | null
          updated_at: string
        }
        Insert: {
          ai_listing_description?: string | null
          ai_listing_location?: string | null
          ai_listing_price?: number | null
          ai_listing_title?: string | null
          ai_suggestion: string
          analysis_id?: string
          co2_impact: number
          created_at?: string
          current_value?: number | null
          emotional_score: number
          environmental_impact: Database["public"]["Enums"]["environmental_impact_level"]
          images?: Json
          is_recyclable: boolean
          item_category: Database["public"]["Enums"]["product_category"]
          item_condition: Database["public"]["Enums"]["product_condition"]
          item_name: string
          landfill_impact: string
          maintenance_cost?: number | null
          original_price?: number | null
          recommendation: Database["public"]["Enums"]["recommendation_action"]
          session_id: number
          space_value?: number | null
          updated_at?: string
        }
        Update: {
          ai_listing_description?: string | null
          ai_listing_location?: string | null
          ai_listing_price?: number | null
          ai_listing_title?: string | null
          ai_suggestion?: string
          analysis_id?: string
          co2_impact?: number
          created_at?: string
          current_value?: number | null
          emotional_score?: number
          environmental_impact?: Database["public"]["Enums"]["environmental_impact_level"]
          images?: Json
          is_recyclable?: boolean
          item_category?: Database["public"]["Enums"]["product_category"]
          item_condition?: Database["public"]["Enums"]["product_condition"]
          item_name?: string
          landfill_impact?: string
          maintenance_cost?: number | null
          original_price?: number | null
          recommendation?: Database["public"]["Enums"]["recommendation_action"]
          session_id?: number
          space_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "let_go_buddy_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      let_go_buddy_sessions: {
        Row: {
          created_at: string
          is_completed: boolean
          session_id: number
          situation: Database["public"]["Enums"]["declutter_situation"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_completed?: boolean
          session_id?: never
          situation: Database["public"]["Enums"]["declutter_situation"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_completed?: boolean
          session_id?: never
          situation?: Database["public"]["Enums"]["declutter_situation"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      local_business_reviews: {
        Row: {
          author: string
          author_avatar: string | null
          business_id: number
          created_at: string
          rating: number
          tags: Json
          timestamp: string
        }
        Insert: {
          author: string
          author_avatar?: string | null
          business_id: number
          created_at?: string
          rating: number
          tags?: Json
          timestamp: string
        }
        Update: {
          author?: string
          author_avatar?: string | null
          business_id?: number
          created_at?: string
          rating?: number
          tags?: Json
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_business_id_local_businesses_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      local_businesses: {
        Row: {
          address: string | null
          average_rating: number
          created_at: string
          description: string | null
          id: number
          image: string | null
          location: string
          name: string
          price_range: string
          tags: Json
          total_reviews: number
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number
          created_at?: string
          description?: string | null
          id?: never
          image?: string | null
          location: string
          name: string
          price_range: string
          tags?: Json
          total_reviews?: number
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number
          created_at?: string
          description?: string | null
          id?: never
          image?: string | null
          location?: string
          name?: string
          price_range?: string
          tags?: Json
          total_reviews?: number
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      local_tip_comments: {
        Row: {
          author: string
          comment_id: number
          content: string
          created_at: string
          likes: number
          post_id: number
        }
        Insert: {
          author: string
          comment_id?: never
          content: string
          created_at?: string
          likes?: number
          post_id: number
        }
        Update: {
          author?: string
          comment_id?: never
          content?: string
          created_at?: string
          likes?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tip_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      local_tip_posts: {
        Row: {
          author: string
          category: string
          comments: number
          content: string
          created_at: string
          id: number
          likes: number
          location: string
          reviews: number
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          comments?: number
          content: string
          created_at?: string
          id?: never
          likes?: number
          location: string
          reviews?: number
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          comments?: number
          content?: string
          created_at?: string
          id?: never
          likes?: number
          location?: string
          reviews?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      message_participants: {
        Row: {
          conversation_id: number
          created_at: string
          profile_id: string
        }
        Insert: {
          conversation_id: number
          created_at?: string
          profile_id: string
        }
        Update: {
          conversation_id?: number
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_participants_conversation_id_user_conversations_convers"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      product_images: {
        Row: {
          image_order: number
          image_url: string
          is_primary: boolean
          product_id: number
        }
        Insert: {
          image_order?: number
          image_url: string
          is_primary?: boolean
          product_id: number
        }
        Update: {
          image_order?: number
          image_url?: string
          is_primary?: boolean
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_likes: {
        Row: {
          product_id: number
          user_id: string
        }
        Insert: {
          product_id: number
          user_id: string
        }
        Update: {
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      product_views: {
        Row: {
          product_id: number
          user_id: string | null
          view_id: number
          viewed_at: string
        }
        Insert: {
          product_id: number
          user_id?: string | null
          view_id?: never
          viewed_at?: string
        }
        Update: {
          product_id?: number
          user_id?: string | null
          view_id?: never
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          currency: string
          description: string
          isSold: boolean
          location: string
          price: number
          price_type: Database["public"]["Enums"]["price_type"]
          product_id: number
          seller_id: string
          stats: Json
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          currency?: string
          description: string
          isSold?: boolean
          location: string
          price: number
          price_type?: Database["public"]["Enums"]["price_type"]
          product_id?: never
          seller_id: string
          stats?: Json
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          currency?: string
          description?: string
          isSold?: boolean
          location?: string
          price?: number
          price_type?: Database["public"]["Enums"]["price_type"]
          product_id?: never
          seller_id?: string
          stats?: Json
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_categories_category_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_conversations: {
        Row: {
          conversation_id: number
          created_at: string
        }
        Insert: {
          conversation_id?: never
          created_at?: string
        }
        Update: {
          conversation_id?: never
          created_at?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          content: string
          conversation_id: number
          created_at: string
          media_url: string | null
          message_id: number
          message_type: Database["public"]["Enums"]["message_type"]
          receiver_id: string
          seen: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: number
          created_at?: string
          media_url?: string | null
          message_id?: never
          message_type?: Database["public"]["Enums"]["message_type"]
          receiver_id: string
          seen?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: number
          created_at?: string
          media_url?: string | null
          message_id?: never
          message_type?: Database["public"]["Enums"]["message_type"]
          receiver_id?: string
          seen?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_messages_conversation_id_user_conversations_conversation_i"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          data: Json
          is_read: boolean
          message_id: number | null
          notification_id: number
          product_id: number | null
          read_at: string | null
          receiver_id: string
          review_id: number | null
          sender_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          data?: Json
          is_read?: boolean
          message_id?: number | null
          notification_id?: never
          product_id?: number | null
          read_at?: string | null
          receiver_id: string
          review_id?: number | null
          sender_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          data?: Json
          is_read?: boolean
          message_id?: number | null
          notification_id?: never
          product_id?: number | null
          read_at?: string | null
          receiver_id?: string
          review_id?: number | null
          sender_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_message_id_user_messages_message_id_fk"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "user_messages"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_review_id_give_and_glow_reviews_id_fk"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          appreciation_badge: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          location: string
          profile_id: string
          rating: number
          response_rate: number
          response_time: string
          total_likes: number
          total_listings: number
          total_views: number
          updated_at: string
          username: string
        }
        Insert: {
          appreciation_badge?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          location: string
          profile_id: string
          rating?: number
          response_rate?: number
          response_time?: string
          total_likes?: number
          total_listings?: number
          total_views?: number
          updated_at?: string
          username: string
        }
        Update: {
          appreciation_badge?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          location?: string
          profile_id?: string
          rating?: number
          response_rate?: number
          response_time?: string
          total_likes?: number
          total_listings?: number
          total_views?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          created_at: string
          rating: number
          review_id: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          rating: number
          review_id?: never
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          created_at?: string
          rating?: number
          review_id?: never
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      declutter_situation:
        | "moving"
        | "downsizing"
        | "spring_cleaning"
        | "digital_declutter"
        | "minimalism"
        | "inheritance"
        | "relationship_change"
        | "other"
      environmental_impact_level: "low" | "medium" | "high" | "critical"
      local_tip_categories:
        | "Visa"
        | "Bank"
        | "Tax"
        | "Health"
        | "Education"
        | "Transportation"
        | "Other"
      message_type: "text" | "image" | "file" | "audio" | "video" | "location"
      notification_type: "message" | "like" | "reply" | "mention"
      price_type: "fixed" | "negotiable" | "free" | "auction"
      product_category:
        | "electronics"
        | "clothing"
        | "books"
        | "home"
        | "sports"
        | "beauty"
        | "toys"
        | "automotive"
        | "health"
        | "other"
      product_condition:
        | "new"
        | "like_new"
        | "excellent"
        | "good"
        | "fair"
        | "poor"
      recommendation_action:
        | "keep"
        | "sell"
        | "donate"
        | "recycle"
        | "repair"
        | "repurpose"
        | "discard"
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
      declutter_situation: [
        "moving",
        "downsizing",
        "spring_cleaning",
        "digital_declutter",
        "minimalism",
        "inheritance",
        "relationship_change",
        "other",
      ],
      environmental_impact_level: ["low", "medium", "high", "critical"],
      local_tip_categories: [
        "Visa",
        "Bank",
        "Tax",
        "Health",
        "Education",
        "Transportation",
        "Other",
      ],
      message_type: ["text", "image", "file", "audio", "video", "location"],
      notification_type: ["message", "like", "reply", "mention"],
      price_type: ["fixed", "negotiable", "free", "auction"],
      product_category: [
        "electronics",
        "clothing",
        "books",
        "home",
        "sports",
        "beauty",
        "toys",
        "automotive",
        "health",
        "other",
      ],
      product_condition: [
        "new",
        "like_new",
        "excellent",
        "good",
        "fair",
        "poor",
      ],
      recommendation_action: [
        "keep",
        "sell",
        "donate",
        "recycle",
        "repair",
        "repurpose",
        "discard",
      ],
    },
  },
} as const
