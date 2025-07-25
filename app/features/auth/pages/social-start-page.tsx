import { redirect } from "react-router";
import z from 'zod';
import { Route } from './+types/social-start-page';
import { makeSSRClient } from '~/supa-client';

const paramSchema = z.object({
  provider: z.enum(["google", "facebook", "line"]),
});

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramSchema.safeParse(params);
  if (!success) {
    return redirect('/auth/login');
  }
  const { provider } = data;
  
  // Get the current origin from the request
  const url = new URL(request.url);
  const origin = url.origin;
  
  // Line provider는 커스텀 OAuth URL로 리다이렉트
  if (provider === "line") {
    const LINE_REDIRECT_URI = `${origin}/auth/social/line/complete`;
    
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.set('response_type', 'code');
    lineAuthUrl.searchParams.set('client_id', LINE_CHANNEL_ID);
    lineAuthUrl.searchParams.set('redirect_uri', LINE_REDIRECT_URI);
    lineAuthUrl.searchParams.set('state', 'line_auth_state');
    lineAuthUrl.searchParams.set('scope', 'profile openid');
    
    return redirect(lineAuthUrl.toString());
  }
  
  // Google, Facebook는 Supabase OAuth 사용
  const redirectTo = `${origin}/auth/social/${provider}/complete`;
  // const redirectTo = `http://localhost:5173`;
  const { client, headers } = makeSSRClient(request);
  const { data: { url: authUrl } , error } = await client.auth.signInWithOAuth({
    provider,
    options: {redirectTo},
  });
  if(authUrl) {
    return redirect(authUrl, { headers });
  }
  if(error) {
    throw error;
  }
};