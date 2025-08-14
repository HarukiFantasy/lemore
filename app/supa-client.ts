import { createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { Database as SupabaseDatabase } from "../database.types";
import { MergeDeep, SetNonNullable } from "type-fest";

export type Database = MergeDeep<SupabaseDatabase, {
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)'
  }
  public: {
    Views: {
      // Community views removed
      products_listings_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["products_listings_view"]["Row"]>
      }
      product_detail_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["product_detail_view"]["Row"]>
      }
      // Let Go Buddy views - commented out until database views are created
      // let_go_buddy_sessions_with_items_view: {
      //   Row: any
      // }
      user_messages_view: {
        Row: SetNonNullable<SupabaseDatabase["public"]["Views"]["user_messages_view"]["Row"]>
      }
      // item_analyses_detailed_view: {
      //   Row: any
      // }
      // environmental_impact_summary_view: {
      //   Row: any
      // }
    }
  }
}>;

export const browserClient = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Improved token refresh handling
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'lemore'
      }
    }
  }
);

// Add authentication state change listener for better error handling
if (typeof window !== 'undefined') {
  browserClient.auth.onAuthStateChange(async (event) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      // Clear any cached data if needed
    } else if (event === 'USER_UPDATED') {
      console.log('User updated');
    }
  });
}

// Development auth helper
const DEV_USER_ID = 'dev-user-12345';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const getDevelopmentUser = () => ({
  id: DEV_USER_ID,
  email: 'dev@lemore.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // Add other user properties as needed
});

// Ensure development user profile exists in database
const ensureDevUserProfile = async (client: any) => {
  if (!IS_DEVELOPMENT) return;
  
  try {
    // Check if dev user profile exists
    const { data: existingProfile } = await client
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', DEV_USER_ID)
      .single();
    
    if (!existingProfile) {
      // Create development user profile
      await client
        .from('user_profiles')
        .insert({
          user_id: DEV_USER_ID,
          username: 'dev_user',
          display_name: 'Development User',
          email: 'dev@lemore.com',
          location: 'Bangkok',
          created_at: new Date().toISOString()
        });
      console.log('✅ Development user profile created');
    }
  } catch (error) {
    console.log('ℹ️  Development user profile creation skipped (already exists or error):', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Helper function to get user with development bypass
export const getAuthUser = async (client: any) => {
  if (IS_DEVELOPMENT) {
    // Ensure dev user profile exists in database
    await ensureDevUserProfile(client);
    
    // In development, set a fake JWT context for RPC calls
    try {
      // Create a minimal JWT payload for development
      const devJwt = {
        sub: DEV_USER_ID,
        email: 'dev@lemore.com',
        role: 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      // Set the auth context for this client session
      // This is a hack for development to make RPC functions work
      const authHeader = `Bearer ${Buffer.from(JSON.stringify(devJwt)).toString('base64')}`;
      client.rest.headers = { 
        ...client.rest.headers, 
        Authorization: authHeader,
        'X-Client-Info': 'lemore-dev'
      };
      
    } catch (error) {
      console.log('Failed to set dev auth context:', error);
    }
    
    // In development, always return a mock user
    return {
      data: { user: getDevelopmentUser() },
      error: null
    };
  }
  
  // In production, use real auth
  return await client.auth.getUser();
};

export const makeSSRClient = (request: Request) => {
  const headers = new Headers();
  const serverSideClient = createServerClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false, // Server-side doesn't need auto refresh
        persistSession: false,   // Server-side doesn't persist
        detectSessionInUrl: false, // Server-side doesn't detect URL session
        flowType: 'pkce'
      },
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
      global: {
        headers: {
          'x-application-name': 'lemore'
        }
      }
    }
  );

  return {
    client: serverSideClient,
    headers,
  };
};
