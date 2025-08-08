import { redirect } from "react-router";
import z from 'zod';
import { Route } from './+types/social-complete-page';
import { makeSSRClient } from '~/supa-client';

const paramSchema = z.object({
  provider: z.enum(["google", "facebook", "line", "kakao"]),
});

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramSchema.safeParse(params);
  if (!success) {
    return redirect('/auth/login');
  }
  const { provider } = data;
  
  // Get the current origin from the request
  const url = new URL(request.url);
  const origin = url.origin;
  const LINE_REDIRECT_URI = `${origin}/auth/social/line/complete`;
  
  // Line provider는 커스텀 처리
  if (provider === "line") {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // 에러 체크
    if (error) {
      console.error('Line OAuth error:', error);
      return redirect('/auth/login?error=line_auth_failed');
    }

    if (!code) {
      console.error('No authorization code received');
      return redirect('/auth/login?error=no_code');
    }

    try {
      // 1. access_token 요청
      const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: LINE_REDIRECT_URI,
          client_id: LINE_CHANNEL_ID,
          client_secret: LINE_CHANNEL_SECRET,
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Token request failed:', await tokenResponse.text());
        return redirect('/auth/login?error=token_failed');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. 프로필 요청
      const profileResponse = await fetch('https://api.line.me/v2/profile', {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        console.error('Profile request failed:', await profileResponse.text());
        return redirect('/auth/login?error=profile_failed');
      }

      const profile = await profileResponse.json();
      
      // 3. Supabase 클라이언트 생성
      const { client, headers } = makeSSRClient(request);
      
      // 4. 사용자 정보로 Supabase에 로그인/회원가입
      const { data: authData, error: authError } = await client.auth.signInWithPassword({
        email: `line_${profile.userId}@line.local`,
        password: `line_${profile.userId}_${LINE_CHANNEL_SECRET}`,
      });

      if (authError) {
        // 사용자가 존재하지 않으면 회원가입
        if (authError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await client.auth.signUp({
            email: `line_${profile.userId}@line.local`,
            password: `line_${profile.userId}_${LINE_CHANNEL_SECRET}`,
            options: {
              data: {
                line_id: profile.userId,
                name: profile.displayName,
                avatar_url: profile.pictureUrl,
              },
            },
          });

          if (signUpError) {
            console.error('Sign up error:', signUpError);
            return redirect('/auth/login?error=signup_failed');
          }

          // 회원가입 후 다시 로그인 시도
          const { data: loginData, error: loginError } = await client.auth.signInWithPassword({
            email: `line_${profile.userId}@line.local`,
            password: `line_${profile.userId}_${LINE_CHANNEL_SECRET}`,
          });

          if (loginError) {
            console.error('Login error after signup:', loginError);
            return redirect('/auth/login?error=login_failed');
          }
        } else {
          console.error('Auth error:', authError);
          return redirect('/auth/login?error=auth_failed');
        }
      }

      // 5. 성공적으로 로그인되면 홈페이지로 리다이렉트
      // 세션 헤더를 포함하여 리다이렉트
      const { data: sessionData } = await client.auth.getSession();
      console.log('🔍 Session after Line login:', sessionData);
      
      if (sessionData.session) {
        console.log('✅ Session found, redirecting to home');
        return redirect('/', { headers });
      } else {
        console.error('❌ No session after login');
        return redirect('/auth/login?error=session_failed');
      }

    } catch (error) {
      console.error('Line OAuth processing error:', error);
      return redirect('/auth/login?error=processing_failed');
    }
  }
  
  // Google, Facebook, Kakao는 Supabase OAuth 처리
  
  const code = url.searchParams.get('code');
  if (!code) {
    console.error('❌ No authorization code received');
    return Response.json(
      { error: "requested path is invalid" },
      { status: 400 }
    );
  }
  const { client, headers } = makeSSRClient(request);
  
  const { data: sessionData, error } = await client.auth.exchangeCodeForSession(code);
  
  if (error) { 
    // Return a more specific error instead of throwing
    return Response.json(
      { error: `OAuth exchange failed: ${error.message || 'Unknown error'}` },
      { status: 400 }
    );
  }
  
  // 세션 확인
  if (!sessionData.session) {
    console.error('❌ No session after exchange');
    throw new Error('No session after OAuth exchange');
  }
  
  // 사용자 프로필이 없으면 생성
  if (sessionData.user) {
    try {
      const { data: existingProfile } = await client
        .from('user_profiles')
        .select('*')
        .eq('profile_id', sessionData.user.id)
        .maybeSingle();
      
      if (!existingProfile) {
                  const { error: profileError } = await client
            .from('user_profiles')
            .insert({
              profile_id: sessionData.user.id,
              username: `${sessionData.user.email?.split('@')[0] || 'user'}_${Date.now()}`,
              email: sessionData.user.email,
              avatar_url: sessionData.user.user_metadata?.avatar_url,
            });
        
        if (profileError) {
          console.error('❌ Failed to create user profile:', profileError);
        } else {
          console.log('✅ User profile created successfully');
        }
      }
    } catch (profileError) {
      console.error('❌ Error checking/creating user profile:', profileError);
    }
  }
  
  return redirect('/', { headers });
};

export default function SocialCompletePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Social Login...</p>
      </div>
    </div>
  );
}