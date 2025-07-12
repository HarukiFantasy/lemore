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
          location: Database["public"]["Enums"]["location"]
          product_id: number | null
          rating: number
          receiver_id: string
          review: string
          tags: Json
          timestamp: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          giver_id: string
          id?: never
          location: Database["public"]["Enums"]["location"]
          product_id?: number | null
          rating: number
          receiver_id: string
          review: string
          tags?: Json
          timestamp: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          giver_id?: string
          id?: never
          location?: Database["public"]["Enums"]["location"]
          product_id?: number | null
          rating?: number
          receiver_id?: string
          review?: string
          tags?: Json
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      item_analyses: {
        Row: {
          ai_listing_description: string | null
          ai_listing_location: Database["public"]["Enums"]["location"] | null
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
          ai_listing_location?: Database["public"]["Enums"]["location"] | null
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
          ai_listing_location?: Database["public"]["Enums"]["location"] | null
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
            referencedRelation: "environmental_impact_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "let_go_buddy_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "let_go_buddy_sessions_with_items_view"
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      local_business_reviews: {
        Row: {
          author: string
          author_avatar: string | null
          business_id: number
          content: string | null
          created_at: string
          rating: number
          tags: Json
          timestamp: string
        }
        Insert: {
          author: string
          author_avatar?: string | null
          business_id: number
          content?: string | null
          created_at?: string
          rating: number
          tags?: Json
          timestamp: string
        }
        Update: {
          author?: string
          author_avatar?: string | null
          business_id?: number
          content?: string | null
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_business_id_local_businesses_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_business_reviews_business_id_local_businesses_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses_list_view"
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
          location: Database["public"]["Enums"]["location"]
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
          location: Database["public"]["Enums"]["location"]
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
          location?: Database["public"]["Enums"]["location"]
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
      local_tip_comment_likes: {
        Row: {
          comment_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_comment_likes_comment_id_local_tip_comments_comment_i"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "local_tip_comments"
            referencedColumns: ["comment_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_comment_id_local_tip_comments_comment_i"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "local_tip_comments_view"
            referencedColumns: ["comment_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tip_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_tip_comments_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tips_list_view"
            referencedColumns: ["id"]
          },
        ]
      }
      local_tip_post_likes: {
        Row: {
          created_at: string
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_post_likes_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tip_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tips_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      local_tip_posts: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["local_tip_categories"]
          content: string
          created_at: string
          id: number
          location: Database["public"]["Enums"]["location"]
          stats: Json
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: Database["public"]["Enums"]["local_tip_categories"]
          content: string
          created_at?: string
          id?: never
          location: Database["public"]["Enums"]["location"]
          stats?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["local_tip_categories"]
          content?: string
          created_at?: string
          id?: never
          location?: Database["public"]["Enums"]["location"]
          stats?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      locations: {
        Row: {
          description: string | null
          display_name: string
          is_active: boolean
          location_id: number
          name: Database["public"]["Enums"]["location"]
          population: number | null
        }
        Insert: {
          description?: string | null
          display_name: string
          is_active?: boolean
          location_id?: never
          name: Database["public"]["Enums"]["location"]
          population?: number | null
        }
        Update: {
          description?: string | null
          display_name?: string
          is_active?: boolean
          location_id?: never
          name?: Database["public"]["Enums"]["location"]
          population?: number | null
        }
        Relationships: []
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_likes: {
        Row: {
          created_at: string
          product_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
          is_sold: boolean
          location: Database["public"]["Enums"]["location"]
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
          is_sold?: boolean
          location: Database["public"]["Enums"]["location"]
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
          is_sold?: boolean
          location?: Database["public"]["Enums"]["location"]
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
            foreignKeyName: "products_category_id_categories_category_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
            foreignKeyName: "user_notifications_message_id_user_messages_message_id_fk"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "user_messages_view"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
            foreignKeyName: "user_notifications_review_id_give_and_glow_reviews_id_fk"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_view"
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
          email: string | null
          location: Database["public"]["Enums"]["location"] | null
          phone: string | null
          profile_id: string
          rating: number | null
          response_rate: number | null
          response_time: string | null
          total_likes: number | null
          total_listings: number | null
          total_views: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          appreciation_badge?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          location?: Database["public"]["Enums"]["location"] | null
          phone?: string | null
          profile_id: string
          rating?: number | null
          response_rate?: number | null
          response_time?: string | null
          total_likes?: number | null
          total_listings?: number | null
          total_views?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          appreciation_badge?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          location?: Database["public"]["Enums"]["location"] | null
          phone?: string | null
          profile_id?: string
          rating?: number | null
          response_rate?: number | null
          response_time?: string | null
          total_likes?: number | null
          total_listings?: number | null
          total_views?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      environmental_impact_summary_view: {
        Row: {
          avg_co2_impact: number | null
          critical_impact_items: number | null
          high_impact_items: number | null
          is_completed: boolean | null
          items_to_donate: number | null
          items_to_keep: number | null
          items_to_recycle: number | null
          items_to_sell: number | null
          low_impact_items: number | null
          medium_impact_items: number | null
          recyclable_items: number | null
          session_date: string | null
          session_id: number | null
          situation: Database["public"]["Enums"]["declutter_situation"] | null
          total_co2_impact: number | null
          total_items: number | null
          total_original_value: number | null
          total_value_created: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      give_and_glow_view: {
        Row: {
          category: Database["public"]["Enums"]["product_category"] | null
          created_at: string | null
          giver_avatar_url: string | null
          giver_id: string | null
          giver_profile_id: string | null
          giver_username: string | null
          id: number | null
          location: Database["public"]["Enums"]["location"] | null
          product_description: string | null
          product_id: number | null
          product_location: Database["public"]["Enums"]["location"] | null
          product_title: string | null
          rating: number | null
          receiver_avatar_url: string | null
          receiver_id: string | null
          receiver_profile_id: string | null
          receiver_username: string | null
          review: string | null
          tags: Json | null
          timestamp: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["giver_profile_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["receiver_profile_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      item_analyses_detailed_view: {
        Row: {
          ai_listing_description: string | null
          ai_listing_location: Database["public"]["Enums"]["location"] | null
          ai_listing_price: number | null
          ai_listing_title: string | null
          ai_suggestion: string | null
          analysis_id: string | null
          avatar_url: string | null
          co2_impact: number | null
          created_at: string | null
          current_value: number | null
          effective_value: number | null
          emotional_attachment_level: string | null
          emotional_score: number | null
          environmental_impact:
            | Database["public"]["Enums"]["environmental_impact_level"]
            | null
          environmental_impact_display: string | null
          images: Json | null
          is_decision_made: boolean | null
          is_recyclable: boolean | null
          item_category: Database["public"]["Enums"]["product_category"] | null
          item_condition:
            | Database["public"]["Enums"]["product_condition"]
            | null
          item_name: string | null
          landfill_impact: string | null
          maintenance_cost: number | null
          original_price: number | null
          recommendation:
            | Database["public"]["Enums"]["recommendation_action"]
            | null
          recommendation_display: string | null
          session_completed: boolean | null
          session_created_at: string | null
          session_id: number | null
          situation: Database["public"]["Enums"]["declutter_situation"] | null
          space_value: number | null
          updated_at: string | null
          user_location: Database["public"]["Enums"]["location"] | null
          username: string | null
          value_change_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "environmental_impact_summary_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "let_go_buddy_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "let_go_buddy_sessions_with_items_view"
            referencedColumns: ["session_id"]
          },
        ]
      }
      let_go_buddy_sessions_with_items_view: {
        Row: {
          ai_listing_description: string | null
          ai_listing_location: Database["public"]["Enums"]["location"] | null
          ai_listing_price: number | null
          ai_listing_title: string | null
          ai_suggestion: string | null
          analysis_id: string | null
          avatar_url: string | null
          avg_emotional_score: number | null
          co2_impact: number | null
          completed_items_in_session: number | null
          current_value: number | null
          emotional_score: number | null
          environmental_impact:
            | Database["public"]["Enums"]["environmental_impact_level"]
            | null
          images: Json | null
          is_completed: boolean | null
          is_recyclable: boolean | null
          item_category: Database["public"]["Enums"]["product_category"] | null
          item_condition:
            | Database["public"]["Enums"]["product_condition"]
            | null
          item_created_at: string | null
          item_name: string | null
          item_updated_at: string | null
          landfill_impact: string | null
          maintenance_cost: number | null
          original_price: number | null
          recommendation:
            | Database["public"]["Enums"]["recommendation_action"]
            | null
          session_created_at: string | null
          session_id: number | null
          session_updated_at: string | null
          situation: Database["public"]["Enums"]["declutter_situation"] | null
          space_value: number | null
          total_co2_impact: number | null
          total_items_in_session: number | null
          total_value_created: number | null
          user_id: string | null
          user_location: Database["public"]["Enums"]["location"] | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      local_businesses_list_view: {
        Row: {
          address: string | null
          average_rating: number | null
          description: string | null
          id: number | null
          image: string | null
          location: Database["public"]["Enums"]["location"] | null
          name: string | null
          price_range: string | null
          tags: Json | null
          total_reviews: number | null
          type: string | null
          website: string | null
        }
        Relationships: []
      }
      local_reviews_list_view: {
        Row: {
          author: string | null
          author_avatar: string | null
          author_username: string | null
          business_id: number | null
          business_name: string | null
          business_type: string | null
          content: string | null
          created_at: string | null
          rating: number | null
          tags: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_business_reviews_business_id_local_businesses_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_business_reviews_business_id_local_businesses_id_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses_list_view"
            referencedColumns: ["id"]
          },
        ]
      }
      local_tip_comments_view: {
        Row: {
          author: string | null
          author_avatar: string | null
          author_location: Database["public"]["Enums"]["location"] | null
          author_username: string | null
          comment_id: number | null
          content: string | null
          created_at: string | null
          likes: number | null
          post_category:
            | Database["public"]["Enums"]["local_tip_categories"]
            | null
          post_id: number | null
          post_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_comments_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tip_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_tip_comments_post_id_local_tip_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "local_tips_list_view"
            referencedColumns: ["id"]
          },
        ]
      }
      local_tips_list_view: {
        Row: {
          author: string | null
          avatar_url: string | null
          category: Database["public"]["Enums"]["local_tip_categories"] | null
          content: string | null
          created_at: string | null
          id: number | null
          location: Database["public"]["Enums"]["location"] | null
          stats: Json | null
          title: string | null
          updated_at: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "local_tip_posts_author_user_profiles_profile_id_fk"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      product_detail_view: {
        Row: {
          all_images: Json | null
          category_id: number | null
          category_name: Database["public"]["Enums"]["product_category"] | null
          condition: Database["public"]["Enums"]["product_condition"] | null
          condition_display: string | null
          created_at: string | null
          currency: string | null
          days_since_posted: number | null
          description: string | null
          formatted_price: string | null
          is_recently_posted: boolean | null
          is_sold: boolean | null
          likes_count: number | null
          location: Database["public"]["Enums"]["location"] | null
          price: number | null
          price_type: Database["public"]["Enums"]["price_type"] | null
          primary_image: string | null
          product_id: number | null
          recent_likes_count: number | null
          recent_views_count: number | null
          seller_appreciation_badge: boolean | null
          seller_avatar: string | null
          seller_bio: string | null
          seller_email: string | null
          seller_id: string | null
          seller_joined_at: string | null
          seller_location: Database["public"]["Enums"]["location"] | null
          seller_name: string | null
          seller_other_listings_count: number | null
          seller_rating: number | null
          seller_response_rate: number | null
          seller_response_time: string | null
          seller_total_likes: number | null
          seller_total_listings: number | null
          seller_total_views: number | null
          stats: Json | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products_listings_view: {
        Row: {
          category_name: Database["public"]["Enums"]["product_category"] | null
          condition: Database["public"]["Enums"]["product_condition"] | null
          created_at: string | null
          currency: string | null
          description: string | null
          is_sold: boolean | null
          likes_count: number | null
          location: Database["public"]["Enums"]["location"] | null
          price: number | null
          price_type: Database["public"]["Enums"]["price_type"] | null
          primary_image: string | null
          product_id: number | null
          seller_appreciation_badge: boolean | null
          seller_avatar: string | null
          seller_id: string | null
          seller_location: Database["public"]["Enums"]["location"] | null
          seller_name: string | null
          seller_rating: number | null
          seller_response_rate: number | null
          seller_response_time: string | null
          stats: Json | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_dashboard_view: {
        Row: {
          active_listings: number | null
          appreciation_badge: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_month_sales: number | null
          email: string | null
          last_month_sales: number | null
          likes_last_7_days: number | null
          location: Database["public"]["Enums"]["location"] | null
          messages_change_text: string | null
          messages_last_7_days: number | null
          profile_id: string | null
          rating: number | null
          response_rate: number | null
          response_time: string | null
          sales_change_percentage: number | null
          sales_change_text: string | null
          sold_items: number | null
          total_likes: number | null
          total_listings: number | null
          total_sales: number | null
          total_views: number | null
          unread_messages: number | null
          updated_at: string | null
          username: string | null
          views_last_7_days: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_messages_view: {
        Row: {
          content: string | null
          conversation_created_at: string | null
          conversation_id: number | null
          created_at: string | null
          media_url: string | null
          message_id: number | null
          message_status: string | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          message_type_category: string | null
          receiver_avatar_url: string | null
          receiver_id: string | null
          receiver_location: Database["public"]["Enums"]["location"] | null
          receiver_username: string | null
          seen: boolean | null
          sender_avatar_url: string | null
          sender_id: string | null
          sender_location: Database["public"]["Enums"]["location"] | null
          sender_username: string | null
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
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["giver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "give_and_glow_view"
            referencedColumns: ["receiver_profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      users_view: {
        Row: {
          appreciation_badge: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          location: Database["public"]["Enums"]["location"] | null
          profile_id: string | null
          rating: number | null
          response_rate: number | null
          response_time: string | null
          total_likes: number | null
          total_listings: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_profile_id_users_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      declutter_situation:
        | "Moving"
        | "Downsizing"
        | "Spring Cleaning"
        | "Digital Declutter"
        | "Minimalism"
        | "Inheritance"
        | "Relationship Change"
        | "Other"
      environmental_impact_level: "Low" | "Medium" | "High" | "Critical"
      local_tip_categories:
        | "Visa"
        | "Bank"
        | "Tax"
        | "Health"
        | "Education"
        | "Transportation"
        | "Other"
      location:
        | "Bangkok"
        | "ChiangMai"
        | "Phuket"
        | "HuaHin"
        | "Pattaya"
        | "Krabi"
        | "Koh Samui"
        | "Other Cities"
      message_type: "Text" | "Image" | "File" | "Audio" | "Video" | "Location"
      notification_type: "Message" | "Like" | "Reply" | "Mention"
      price_type: "Fixed" | "Negotiable" | "Free" | "Auction"
      product_category:
        | "Electronics"
        | "Clothing"
        | "Books"
        | "Home"
        | "Sports"
        | "Beauty"
        | "Toys"
        | "Automotive"
        | "Health"
        | "Other"
      product_condition:
        | "New"
        | "Like New"
        | "Excellent"
        | "Good"
        | "Fair"
        | "Poor"
      recommendation_action:
        | "Keep"
        | "Sell"
        | "Donate"
        | "Recycle"
        | "Repair"
        | "Repurpose"
        | "Discard"
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
        "Moving",
        "Downsizing",
        "Spring Cleaning",
        "Digital Declutter",
        "Minimalism",
        "Inheritance",
        "Relationship Change",
        "Other",
      ],
      environmental_impact_level: ["Low", "Medium", "High", "Critical"],
      local_tip_categories: [
        "Visa",
        "Bank",
        "Tax",
        "Health",
        "Education",
        "Transportation",
        "Other",
      ],
      location: [
        "Bangkok",
        "ChiangMai",
        "Phuket",
        "HuaHin",
        "Pattaya",
        "Krabi",
        "Koh Samui",
        "Other Cities",
      ],
      message_type: ["Text", "Image", "File", "Audio", "Video", "Location"],
      notification_type: ["Message", "Like", "Reply", "Mention"],
      price_type: ["Fixed", "Negotiable", "Free", "Auction"],
      product_category: [
        "Electronics",
        "Clothing",
        "Books",
        "Home",
        "Sports",
        "Beauty",
        "Toys",
        "Automotive",
        "Health",
        "Other",
      ],
      product_condition: [
        "New",
        "Like New",
        "Excellent",
        "Good",
        "Fair",
        "Poor",
      ],
      recommendation_action: [
        "Keep",
        "Sell",
        "Donate",
        "Recycle",
        "Repair",
        "Repurpose",
        "Discard",
      ],
    },
  },
} as const
