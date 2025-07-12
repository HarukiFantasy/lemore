import { redirect } from "react-router";
import { Route } from './+types/line-complete-page';
import { makeSSRClient } from '~/supa-client';

const LINE_CLIENT_ID = process.env.LINE_CLIENT_ID || '';
const LINE_CLIENT_SECRET = process.env.LINE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.LINE_REDIRECT_URI || 'http://localhost:5173/auth/line/complete';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
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
        redirect_uri: REDIRECT_URI,
        client_id: LINE_CLIENT_ID,
        client_secret: LINE_CLIENT_SECRET,
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
      email: `line_${profile.userId}@line.local`, // Line 사용자 ID를 이메일로 사용
      password: `line_${profile.userId}_${LINE_CLIENT_SECRET}`, // 임시 비밀번호
    });

    if (authError) {
      // 사용자가 존재하지 않으면 회원가입
      if (authError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await client.auth.signUp({
          email: `line_${profile.userId}@line.local`,
          password: `line_${profile.userId}_${LINE_CLIENT_SECRET}`,
          options: {
            data: {
              line_id: profile.userId,
              name: profile.displayName,
              avatar_url: profile.pictureUrl,
              provider: 'line',
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
          password: `line_${profile.userId}_${LINE_CLIENT_SECRET}`,
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
    return redirect('/', { headers });

  } catch (error) {
    console.error('Line OAuth processing error:', error);
    return redirect('/auth/login?error=processing_failed');
  }
};

export default function LineCompletePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Line 로그인 처리 중...</p>
      </div>
    </div>
  );
} 