import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { Navigation } from "./common/components/navigation";
import { makeSSRClient } from './supa-client';
import { cn } from './lib/utils';
import { getUserByProfileId } from "./features/users/queries";
import { useAuthErrorHandler } from "./hooks/use-auth-error-handler";
import * as Sentry from "@sentry/react-router";
import { useEffect } from 'react';
import { browserClient } from './supa-client';


export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" type="image/png" href="/lemore-logo.png" sizes="32x32" />
      </head>
      <body>
        <main>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  
  try {
    const { data: {user}, error: authError } = await client.auth.getUser();
    
    // If there's an authentication error (like refresh token not found)
    if (authError) {
      console.warn('Authentication error detected:', authError.message);
      
      // Clear the invalid session
      await client.auth.signOut();
      
      // Return user as null to force logout state
      return { user: null, userProfile: null, client };
    }
    
    if (user) {
      console.log("🔍 User found in session:", user.id, user.email);
      try {
        console.log("🔍 Searching for user profile with ID:", user?.id);
        const userProfile = await getUserByProfileId(client, { profileId: user?.id ?? null });
        console.log("✅ userProfile", userProfile);
        return { user, userProfile, client };
      } catch (error) {
        // User profile not found, but user is authenticated
        console.warn('❌ User profile not found:', error);
        console.warn('❌ User ID:', user.id);
        
        // 사용자 프로필이 없으면 자동 생성
        try {
          console.log('🔧 Creating user profile for:', user.email);
          const { error: profileError } = await client
            .from('user_profiles')
            .insert({
              profile_id: user.id,
              username: `${user.email?.split('@')[0] || 'user'}_${Date.now()}`,
              email: user.email,
              avatar_url: user.user_metadata?.avatar_url,
            });
          
          if (profileError) {
            console.error('❌ Failed to create user profile:', profileError);
          } else {
            console.log('✅ User profile created successfully');
            // 생성된 프로필 다시 조회
            const newUserProfile = await getUserByProfileId(client, { profileId: user.id });
            return { user, userProfile: newUserProfile, client };
          }
        } catch (createError) {
          console.error('❌ Error creating user profile:', createError);
        }
        
        return { user, userProfile: null, client };
      }
    }
    
    return { user: null, userProfile: null, client };
  } catch (error: any) {
    // Handle any other authentication-related errors
    console.error('Root loader authentication error:', error);
    
    // If it's a refresh token error or similar, clear the session
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.code === 'refresh_token_not_found') {
      try {
        await client.auth.signOut();
      } catch (signOutError) {
        console.warn('Error during forced sign out:', signOutError);
      }
    }
    
    // Return user as null to ensure clean state
    return { user: null, userProfile: null, client };
  }
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { user, client } = loaderData;
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isLoggedIn = user !== null;

  // 세션 확인
  useEffect(() => {
    browserClient.auth.getSession().then(({ data, error }: { data: any, error: any }) => {
      console.log("📦 Session:", data?.session);
      console.log("📦 Session ID:", data?.session?.access_token ? "exists" : "missing");
      console.log("📦 User ID:", data?.session?.user?.id);
      console.log("📦 User Email:", data?.session?.user?.email);
      console.log("📦 User Metadata:", data?.session?.user?.user_metadata);
      console.log("🙀 Error:", error);
      
      // 추가: 사용자 프로필 정보 확인
      if (data?.session?.user?.id) {
        console.log("🔍 Checking user profile for ID:", data.session.user.id);
        // 여기서 직접 프로필 조회 테스트
        browserClient.from('user_profiles').select('*').eq('profile_id', data.session.user.id).maybeSingle()
          .then(({ data: profile, error: profileError }) => {
            console.log("🔍 Direct profile query result:", { profile, profileError });
          });
      }
    });
  }, []);

  
  
  // Add global auth error handling
  useAuthErrorHandler();
  
  return (
      <div
      className={cn({
        "py-20": !pathname.includes("/auth/"),
        "transition-opacity animate-pulse": isLoading,
      })}
      > 
        {pathname.includes("/auth") ? null : (
          <Navigation
            isLoggedIn={isLoggedIn}
            username={loaderData.userProfile?.username || "User"}
            avatarUrl={loaderData.userProfile?.avatar_url || ""}
            hasNotifications={true}
            hasMessages={true}
          />
        )}
        <Outlet />
      </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
        if(error.status !== 404) {
          Sentry.captureException(error);
        }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}