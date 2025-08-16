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
      challenge_calendar_items: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          item_id: number
          name: string
          reflection: string | null
          scheduled_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          item_id?: never
          name: string
          reflection?: string | null
          scheduled_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          item_id?: never
          name?: string
          reflection?: string | null
          scheduled_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_calendar_items_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "challenge_calendar_items_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "challenge_calendar_items_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "challenge_calendar_items_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "challenge_calendar_items_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "challenge_calendar_items_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      lgb_item_photos: {
        Row: {
          created_at: string | null
          item_id: string
          photo_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          item_id: string
          photo_id?: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          item_id?: string
          photo_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgb_item_photos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "lgb_items"
            referencedColumns: ["item_id"]
          },
        ]
      }
      lgb_items: {
        Row: {
          ai_rationale: string | null
          ai_recommendation: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          decision: string | null
          decision_reason: string | null
          item_id: string
          notes: string | null
          price_confidence: number | null
          price_high: number | null
          price_low: number | null
          price_mid: number | null
          sentiment: string | null
          session_id: string
          title: string | null
          updated_at: string | null
          usage_score: number | null
        }
        Insert: {
          ai_rationale?: string | null
          ai_recommendation?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          decision?: string | null
          decision_reason?: string | null
          item_id?: string
          notes?: string | null
          price_confidence?: number | null
          price_high?: number | null
          price_low?: number | null
          price_mid?: number | null
          sentiment?: string | null
          session_id: string
          title?: string | null
          updated_at?: string | null
          usage_score?: number | null
        }
        Update: {
          ai_rationale?: string | null
          ai_recommendation?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          decision?: string | null
          decision_reason?: string | null
          item_id?: string
          notes?: string | null
          price_confidence?: number | null
          price_high?: number | null
          price_low?: number | null
          price_mid?: number | null
          sentiment?: string | null
          session_id?: string
          title?: string | null
          updated_at?: string | null
          usage_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lgb_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lgb_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "lgb_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_session_full"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "lgb_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "view_session_dashboard"
            referencedColumns: ["session_id"]
          },
        ]
      }
      lgb_listings: {
        Row: {
          body: string
          channels: string[] | null
          created_at: string | null
          hashtags: string[] | null
          item_id: string
          lang: string
          listing_id: string
          title: string
        }
        Insert: {
          body: string
          channels?: string[] | null
          created_at?: string | null
          hashtags?: string[] | null
          item_id: string
          lang: string
          listing_id?: string
          title: string
        }
        Update: {
          body?: string
          channels?: string[] | null
          created_at?: string | null
          hashtags?: string[] | null
          item_id?: string
          lang?: string
          listing_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgb_listings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "lgb_items"
            referencedColumns: ["item_id"]
          },
        ]
      }
      lgb_sessions: {
        Row: {
          created_at: string | null
          decided_count: number | null
          expected_revenue: number | null
          item_count: number | null
          move_date: string | null
          region: string | null
          scenario: string
          session_id: string
          status: string | null
          title: string | null
          trade_method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decided_count?: number | null
          expected_revenue?: number | null
          item_count?: number | null
          move_date?: string | null
          region?: string | null
          scenario: string
          session_id?: string
          status?: string | null
          title?: string | null
          trade_method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          decided_count?: number | null
          expected_revenue?: number | null
          item_count?: number | null
          move_date?: string | null
          region?: string | null
          scenario?: string
          session_id?: string
          status?: string | null
          title?: string | null
          trade_method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          country: Database["public"]["Enums"]["country"]
          currency: string
          description: string | null
          display_name: string
          is_active: boolean
          location_id: number
          name: Database["public"]["Enums"]["location"]
          population: number | null
          timezone: string
        }
        Insert: {
          country: Database["public"]["Enums"]["country"]
          currency: string
          description?: string | null
          display_name: string
          is_active?: boolean
          location_id?: never
          name: Database["public"]["Enums"]["location"]
          population?: number | null
          timezone: string
        }
        Update: {
          country?: Database["public"]["Enums"]["country"]
          currency?: string
          description?: string | null
          display_name?: string
          is_active?: boolean
          location_id?: never
          name?: Database["public"]["Enums"]["location"]
          population?: number | null
          timezone?: string
        }
        Relationships: []
      }
      message_participants: {
        Row: {
          conversation_id: number
          created_at: string
          is_hidden: boolean | null
          profile_id: string
        }
        Insert: {
          conversation_id: number
          created_at?: string
          is_hidden?: boolean | null
          profile_id: string
        }
        Update: {
          conversation_id?: number
          created_at?: string
          is_hidden?: boolean | null
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "message_participants_profile_id_user_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
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
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_seller_stats_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
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
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_seller_stats_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["product_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_likes_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
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
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_seller_stats_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["product_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_views_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          country: Database["public"]["Enums"]["country"]
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
          country?: Database["public"]["Enums"]["country"]
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
          country?: Database["public"]["Enums"]["country"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      trust_scores: {
        Row: {
          completed_trades: number
          created_at: string | null
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_trades?: number
          created_at?: string | null
          score?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_trades?: number
          created_at?: string | null
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_scores_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "trust_scores_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "trust_scores_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "trust_scores_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "trust_scores_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "trust_scores_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_conversations: {
        Row: {
          conversation_id: number
          created_at: string
          product_id: number | null
        }
        Insert: {
          conversation_id?: never
          created_at?: string
          product_id?: number | null
        }
        Update: {
          conversation_id?: never
          created_at?: string
          product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_conversations_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_detail_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_conversations_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_conversations_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_listings_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_conversations_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_seller_stats_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_conversations_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string | null
          free_let_go_buddy_uses: number
          level: Database["public"]["Enums"]["user_level"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          free_let_go_buddy_uses?: number
          level?: Database["public"]["Enums"]["user_level"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          free_let_go_buddy_uses?: number
          level?: Database["public"]["Enums"]["user_level"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_levels_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "product_detail_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_levels_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "products_listings_view"
            referencedColumns: ["seller_id"]
          },
          {
            foreignKeyName: "user_levels_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_levels_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_levels_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_levels_user_id_user_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
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
          sender_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_message_id_user_messages_message_id_fk"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["message_id"]
          },
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
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_seller_stats_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["product_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
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
          level: Database["public"]["Enums"]["user_level"]
          location: Database["public"]["Enums"]["location"] | null
          phone: string | null
          profile_id: string
          rating: number | null
          total_likes: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          appreciation_badge?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          level?: Database["public"]["Enums"]["user_level"]
          location?: Database["public"]["Enums"]["location"] | null
          phone?: string | null
          profile_id: string
          rating?: number | null
          total_likes?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          appreciation_badge?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          level?: Database["public"]["Enums"]["user_level"]
          location?: Database["public"]["Enums"]["location"] | null
          phone?: string | null
          profile_id?: string
          rating?: number | null
          total_likes?: number | null
          updated_at?: string
          username?: string | null
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      notification_view: {
        Row: {
          created_at: string | null
          data: Json | null
          is_read: boolean | null
          message_id: number | null
          notification_id: number | null
          product_id: number | null
          read_at: string | null
          receiver_id: string | null
          receiver_name: string | null
          sender_id: string | null
          sender_name: string | null
          type: Database["public"]["Enums"]["notification_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_message_id_user_messages_message_id_fk"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["message_id"]
          },
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
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_seller_stats_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "user_notifications_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["product_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
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
          seller_avatar: string | null
          seller_bio: string | null
          seller_email: string | null
          seller_id: string | null
          seller_joined_at: string | null
          seller_location: Database["public"]["Enums"]["location"] | null
          seller_name: string | null
          seller_other_listings_count: number | null
          seller_rating: number | null
          stats: Json | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: []
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
          seller_avatar: string | null
          seller_id: string | null
          seller_location: Database["public"]["Enums"]["location"] | null
          seller_name: string | null
          seller_rating: number | null
          stats: Json | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: []
      }
      products_with_seller_stats_view: {
        Row: {
          category_id: number | null
          category_name: Database["public"]["Enums"]["product_category"] | null
          condition: Database["public"]["Enums"]["product_condition"] | null
          country: Database["public"]["Enums"]["country"] | null
          created_at: string | null
          currency: string | null
          description: string | null
          is_sold: boolean | null
          location: Database["public"]["Enums"]["location"] | null
          price: number | null
          price_type: Database["public"]["Enums"]["price_type"] | null
          primary_image: string | null
          product_id: number | null
          seller_avatar: string | null
          seller_id: string | null
          seller_joined_at: string | null
          seller_level: Database["public"]["Enums"]["user_level"] | null
          seller_name: string | null
          stats: Json | null
          tags: Json | null
          title: string | null
          total_likes: number | null
          total_listings: number | null
          total_sold: number | null
          updated_at: string | null
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_seller_id_user_profiles_profile_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_activity_view: {
        Row: {
          activity_timestamp: string | null
          activity_title: string | null
          activity_type: string | null
          avatar_url: string | null
          profile_id: string | null
          related_id: number | null
          related_type: string | null
          time_ago: string | null
          username: string | null
        }
        Relationships: []
      }
      user_conversations_view: {
        Row: {
          content: string | null
          conversation_created_at: string | null
          conversation_id: number | null
          created_at: string | null
          media_url: string | null
          message_id: number | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          product_id: number | null
          product_title: string | null
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_dashboard_view: {
        Row: {
          active_listings: number | null
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
          sales_change_percentage: number | null
          sales_change_text: string | null
          sold_items: number | null
          total_sales: number | null
          unread_messages: number | null
          updated_at: string | null
          username: string | null
          views_last_7_days: number | null
        }
        Relationships: []
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_receiver_id_user_profiles_profile_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
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
            referencedRelation: "user_sales_stats_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_messages_sender_id_user_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_sales_stats_view: {
        Row: {
          active_listings: number | null
          avg_sale_price: number | null
          current_month_sales: number | null
          email: string | null
          last_month_sales: number | null
          last_sale_date: string | null
          level: Database["public"]["Enums"]["user_level"] | null
          profile_id: string | null
          sales_change_percentage: number | null
          sales_last_7_days: number | null
          sold_items: number | null
          total_likes: number | null
          total_listings: number | null
          total_sales: number | null
          username: string | null
        }
        Relationships: []
      }
      user_stats_view: {
        Row: {
          avatar_url: string | null
          joined_at: string | null
          last_listing_created_at: string | null
          level: Database["public"]["Enums"]["user_level"] | null
          profile_id: string | null
          total_likes: number | null
          total_listings: number | null
          total_sold: number | null
          username: string | null
        }
        Relationships: []
      }
      v_session_full: {
        Row: {
          created_at: string | null
          decided_count: number | null
          expected_revenue: number | null
          item_count: number | null
          items: Json | null
          move_date: string | null
          region: string | null
          scenario: string | null
          session_id: string | null
          status: string | null
          title: string | null
          trade_method: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_session_dashboard: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          decided_count: number | null
          expected_revenue: number | null
          item_count: number | null
          scenario: string | null
          session_id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          completion_percentage?: never
          created_at?: string | null
          decided_count?: number | null
          expected_revenue?: number | null
          item_count?: number | null
          scenario?: string | null
          session_id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          completion_percentage?: never
          created_at?: string | null
          decided_count?: number | null
          expected_revenue?: number | null
          item_count?: number | null
          scenario?: string | null
          session_id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_or_create_conversation_with_participants: {
        Args: {
          p_user_id: string
          p_other_user_id: string
          p_product_id?: number
        }
        Returns: Json
      }
      get_user_products: {
        Args: { user_id_param: string }
        Returns: {
          product_id: number
          title: string
          price: number
          is_sold: boolean
        }[]
      }
      rpc_can_open_new_session: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      rpc_create_session: {
        Args: {
          p_scenario: string
          p_title?: string
          p_move_date?: string
          p_region?: string
          p_trade_method?: string
        }
        Returns: string
      }
      rpc_get_session_full: {
        Args: { p_session_id: string }
        Returns: Json
      }
      rpc_update_session_status: {
        Args: { p_session_id: string; p_status: string }
        Returns: boolean
      }
    }
    Enums: {
      country: "Thailand" | "Korea"
      declutter_situation: "Moving" | "Minimalism" | "Spring Cleaning" | "Other"
      location:
        | "Bangkok"
        | "ChiangMai"
        | "Phuket"
        | "HuaHin"
        | "Pattaya"
        | "Krabi"
        | "Koh Samui"
        | "Other Thai Cities"
        | "Seoul"
        | "Busan"
        | "Incheon"
        | "Daegu"
        | "Daejeon"
        | "Gwangju"
        | "Ulsan"
        | "Other Korean Cities"
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
      user_level: "Explorer" | "Connector" | "Sharer" | "Glowmaker" | "Legend"
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
      country: ["Thailand", "Korea"],
      declutter_situation: ["Moving", "Minimalism", "Spring Cleaning", "Other"],
      location: [
        "Bangkok",
        "ChiangMai",
        "Phuket",
        "HuaHin",
        "Pattaya",
        "Krabi",
        "Koh Samui",
        "Other Thai Cities",
        "Seoul",
        "Busan",
        "Incheon",
        "Daegu",
        "Daejeon",
        "Gwangju",
        "Ulsan",
        "Other Korean Cities",
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
      user_level: ["Explorer", "Connector", "Sharer", "Glowmaker", "Legend"],
    },
  },
} as const
