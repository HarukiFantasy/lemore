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
import { useEffect } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import { Navigation } from "./common/components/navigation";
import { Footer } from "./common/components/footer";
import { makeSSRClient } from './supa-client';
import { cn } from './lib/utils';
import { getUserByProfileId, getUnreadNotificationsStatus, getUnreadMessagesStatus } from "./features/users/queries";
import { useAuthErrorHandler } from "./hooks/use-auth-error-handler";
import { PerformanceMonitor } from "./common/components/performance-monitor";
import * as Sentry from "@sentry/react-router";


export const links: Route.LinksFunction = () => [
  // PHASE 4: Essential preconnect for external services
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  
  // PHASE 4: DNS prefetch for API endpoints and CDNs
  { rel: "dns-prefetch", href: "https://api.supabase.co" },
  { rel: "dns-prefetch", href: "https://cdn.jsdelivr.net" },
  { rel: "dns-prefetch", href: "https://sentry.io" },
  
  // PHASE 4: Critical font loading with fallbacks
  {
    rel: "preload",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..600;1,14..32,400..600&display=swap",
    as: "style",
    onLoad: "this.onload=null;this.rel='stylesheet'",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..600;1,14..32,400..600&display=swap",
    media: "print",
    onLoad: "this.media='all'",
  },
  
  // PHASE 4: Critical image assets preloading
  { rel: "preload", href: "/lemore-logo.png", as: "image", type: "image/png" },
  // Note: lemore-logo512.png removed from preload as it's only used for PWA/favicon
  
  // PHASE 4: PWA related (only if you have the actual files)
  { rel: "apple-touch-icon", href: "/lemore-logo512.png", sizes: "180x180" },
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
      // Clear the invalid session
      await client.auth.signOut();
      
      // Return user as null to force logout state
      return { user: null, userProfile: null, hasNotifications: false, hasMessages: false, client };
    }
    
    if (user && user.id) { // user.id의 존재 여부도 함께 확인
      try {
        const userProfile = await getUserByProfileId(client, { profileId: user.id });
        
        if (!userProfile) {
          throw new Error("Profile not found, proceeding to create one.");
        }

        const [hasNotifications, hasMessages] = await Promise.all([
          getUnreadNotificationsStatus(client, user.id),
          getUnreadMessagesStatus(client, user.id),
        ]);

        return { user, userProfile, hasNotifications, hasMessages, client };
      } catch (error) {
        // User profile not found, but user is authenticated
        console.warn(`User profile not found for ${user.id}, creating a new one.`);
        
        // 사용자 프로필이 없으면 자동 생성
        try {
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
            // 생성된 프로필 다시 조회
            const newUserProfile = await getUserByProfileId(client, { profileId: user.id });
            return { user, userProfile: newUserProfile, hasNotifications: false, hasMessages: false, client };
          }
        } catch (createError) {
          console.error('❌ Error creating user profile:', createError);
        }
        
        return { user, userProfile: null, hasNotifications: false, hasMessages: false, client };
      }
    }
    
    return { user: null, userProfile: null, hasNotifications: false, hasMessages: false, client };
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
    return { user: null, userProfile: null, hasNotifications: false, hasMessages: false, client };
  }
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { user, client, hasNotifications, hasMessages } = loaderData;
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isLoggedIn = user !== null;

  // Add global auth error handling
  useAuthErrorHandler();

  // PHASE 4: Service Worker removed - browser HTTP caching is sufficient for small static assets
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* PHASE 4: Performance monitoring for Web Vitals */}
      <PerformanceMonitor />
      
      <div
        className={cn({
          "pt-14": !pathname.includes("/auth/"),
          "transition-opacity animate-pulse": isLoading,
        })}
      > 
        {pathname.includes("/auth") ? null : (
          <Navigation
            isLoggedIn={isLoggedIn}
            username={loaderData.userProfile?.username || "User"}
            avatarUrl={loaderData.userProfile?.avatar_url || ""}
            hasNotifications={hasNotifications}
            hasMessages={hasMessages}
          />
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      {pathname.includes("/auth") ? null : <Footer />}
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
