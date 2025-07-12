import { redirect } from "react-router";
import z from 'zod';
import { Route } from './+types/social-start-page';
import { makeSSRClient } from '~/supa-client';

const paramSchema = z.object({
  provider: z.enum(["google", "facebook", "line"]),
});

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';
const LINE_REDIRECT_URI = process.env.LINE_REDIRECT_URI || 'https://84d5b8aeeed2.ngrok-free.app/auth/social/line/complete';

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramSchema.safeParse(params);
  if (!success) {
    return redirect('/auth/login');
  }
  const { provider } = data;
  
  // Line provider는 커스텀 OAuth URL로 리다이렉트
  if (provider === "line") {
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.set('response_type', 'code');
    lineAuthUrl.searchParams.set('client_id', LINE_CHANNEL_ID);
    lineAuthUrl.searchParams.set('redirect_uri', LINE_REDIRECT_URI);
    lineAuthUrl.searchParams.set('state', 'line_auth_state');
    lineAuthUrl.searchParams.set('scope', 'profile openid');
    
    return redirect(lineAuthUrl.toString());
  }
  
  // Google, Facebook는 Supabase OAuth 사용
  const redirectTo = `http://localhost:5173/auth/social/${provider}/complete`;
  const { client, headers } = makeSSRClient(request);
  const { data: { url } , error } = await client.auth.signInWithOAuth({
    provider,
    options: {redirectTo},
  });
  if(url) {
    return redirect(url, { headers });
  }
  if(error) {
    throw error;
  }
};
