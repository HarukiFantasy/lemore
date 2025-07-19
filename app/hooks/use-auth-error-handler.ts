import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { browserClient } from '~/supa-client';

export function useAuthErrorHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes and handle errors
    const { data: { subscription } } = browserClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to login');
          navigate('/auth/login', { replace: true });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    // Global error handler for Supabase requests
    const handleSupabaseError = (error: any) => {
      if (error?.message?.includes('refresh_token_not_found') || 
          error?.message?.includes('Invalid Refresh Token') ||
          error?.code === 'refresh_token_not_found') {
        console.warn('Authentication token error detected, signing out user');
        browserClient.auth.signOut().then(() => {
          navigate('/auth/login', { replace: true });
        });
      }
    };

    // Set up global error handling
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          
          // Check if response indicates auth error
          if (response.status === 401) {
            const responseText = await response.clone().text();
            if (responseText.includes('refresh_token_not_found') ||
                responseText.includes('Invalid Refresh Token')) {
              handleSupabaseError({ message: 'refresh_token_not_found' });
            }
          }
          
          return response;
        } catch (error) {
          handleSupabaseError(error);
          throw error;
        }
      };

      // Cleanup function to restore original fetch
      return () => {
        window.fetch = originalFetch;
        subscription.unsubscribe();
      };
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Return a function to manually handle auth errors
  const handleAuthError = (error: any) => {
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.code === 'refresh_token_not_found') {
      console.warn('Manual auth error handling, signing out user');
      browserClient.auth.signOut().then(() => {
        navigate('/auth/login', { replace: true });
      });
      return true; // Error was handled
    }
    return false; // Error was not handled
  };

  return { handleAuthError };
} 