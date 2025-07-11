import { createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { Json, Database as SupabaseDatabase } from "../database.types";
import { MergeDeep, SetNonNullable } from "type-fest";
export { Json } from '../database.types'

export type Database = MergeDeep<SupabaseDatabase, {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Views: {
      local_tips_list_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["local_tips_list_view"]["Row"]>
      }
      local_tip_comments_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["local_tip_comments_view"]["Row"]>
      }
      local_businesses_list_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["local_businesses_list_view"]["Row"]>
      }
      local_reviews_list_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["local_reviews_list_view"]["Row"]>
      }
      give_and_glow_view: { 
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["give_and_glow_view"]["Row"]> 
      }
      products_listings_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["products_listings_view"]["Row"]>
      }
      product_detail_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["product_detail_view"]["Row"]>
      }
      let_go_buddy_sessions_with_items_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["let_go_buddy_sessions_with_items_view"]["Row"]>
      }
      user_let_go_buddy_stats_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["user_let_go_buddy_stats_view"]["Row"]>
      }
      user_messages_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["user_messages_view"]["Row"]>
      }
      item_analyses_detailed_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["item_analyses_detailed_view"]["Row"]> & {
          original_price: number | null,
          current_value: number | null,
          ai_listing_price: number | null,
          maintenance_cost: number | null,
          space_value: number | null,
          ai_listing_title: string | null,
          ai_listing_description: string | null,
          ai_listing_location: string | null,
          images: Json | null,
        }
      }
      environmental_impact_summary_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["environmental_impact_summary_view"]["Row"]>
      }
    }
  }
}>;

export const browserClient = createBrowserClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const makeSSRClient = (request: Request) => {
  const headers = new Headers();
  const serverSideClient = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
          return cookies.filter(cookie => cookie.value !== undefined) as { name: string; value: string; }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            );
          });
        },
      },
    }
  );

  return {
    client: serverSideClient,
    headers,
  };
};
