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
      throw authError;
      
      // Clear the invalid session
      await client.auth.signOut();
      
      // Return user as null to force logout state
      return { user: null, userProfile: null };
    }
    
    if (user) {
      try {
        const userProfile = await getUserByProfileId(client, { profileId: user?.id ?? null });
        console.log("✅ userProfile", userProfile);
        return { user, userProfile };
      } catch (error) {
        throw error;
        return { user, userProfile: null };
      }
    }
    
    return { user: null, userProfile: null };
  } catch (error: any) {
    throw error;
    // If it's a refresh token error or similar, clear the session
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.code === 'refresh_token_not_found') {
      try {
        await client.auth.signOut();
      } catch (signOutError) {
        throw signOutError;
      }
    }
    
    // Return user as null to ensure clean state
    return { user: null, userProfile: null };
  }
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isLoggedIn = user !== null;
  
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
