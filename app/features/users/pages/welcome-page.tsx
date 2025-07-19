import { LoaderFunctionArgs } from 'react-router';
import { Resend } from "resend";
import { Route } from './+types/welcome-page';
import { LemoreWelcomeEmail } from 'react-email-starter/emails/welcome-user';
import { makeSSRClient } from '~/supa-client';

const client = new Resend(process.env.RESEND_API_KEY);

// 토큰 생성 함수 (Database Trigger와 동일한 로직)
function generateWelcomeToken(username: string, createdAt: string): string {
  const secret = process.env.WELCOME_EMAIL_SECRET || 'lemore-welcome-secret-2024';
  const payload = `${username}:${createdAt}:${secret}`;
  return btoa(payload); // Base64 인코딩
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  try {
    const { username } = params;
    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    // 1. URL에서 토큰 추출
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      console.error('Missing token for welcome email request');
      return Response.json({ error: "Access token required" }, { status: 401 });
    }

    // 2. Supabase 클라이언트로 사용자 정보 조회
    const { client: supabaseClient } = makeSSRClient(request);
    const { data: userProfile, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('profile_id, email, username, created_at')
      .eq('username', username)
      .single();

    if (userError || !userProfile) {
      console.error('User not found:', userError);
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 3. 토큰 검증
    const expectedToken = generateWelcomeToken(username, userProfile.created_at);
    if (token !== expectedToken) {
      console.error(`Invalid token for user ${username}. Expected: ${expectedToken}, Got: ${token}`);
      return Response.json({ error: "Invalid access token" }, { status: 401 });
    }

    // 4. 시간 제한 체크 (10분 내 가입자만 유효)
    const createdTime = new Date(userProfile.created_at).getTime();
    const currentTime = Date.now();
    const timeDiff = currentTime - createdTime;
    const timeLimit = 10 * 60 * 1000; // 10분

    if (timeDiff > timeLimit) {
      console.error(`Token expired for user ${username}. Created: ${userProfile.created_at}`);
      return Response.json({ error: "Token expired" }, { status: 401 });
    }

    // 5. 이메일이 없는 경우
    if (!userProfile.email) {
      return Response.json({ error: "User email not found" }, { status: 400 });
    }

    // 6. 이미 웰컴 이메일을 발송했는지 확인
    const { data: existingNotification } = await supabaseClient
      .from('user_notifications')
      .select('id')
      .eq('receiver_id', userProfile.profile_id)
      .eq('data->>notification_key', 'welcome_email_sent')
      .single();

    if (existingNotification) {
      return Response.json({ 
        message: "Welcome email already sent to this user",
        already_sent: true 
      });
    }

    // 7. 웰컴 이메일 발송
    const { data, error } = await client.emails.send({
      from: "Sena <sena@mail.lemore.life>",
      to: userProfile.email,
      subject: "Welcome to Lemore! 🌱",
      react: <LemoreWelcomeEmail username={userProfile.username || username} />,
    });

    if (error) {
      console.error('Welcome email send error:', error);
      return Response.json({ error: "Failed to send email", details: error }, { status: 500 });
    }

    // 8. 이메일 발송 완료 알림 생성
    await supabaseClient
      .from('user_notifications')
      .insert({
        type: 'Mention',
        sender_id: userProfile.profile_id,
        receiver_id: userProfile.profile_id,
        data: {
          title: 'Welcome Email Sent',
          content: 'Welcome email has been successfully sent',
          notification_key: 'welcome_email_sent',
          email_id: data?.id,
          sent_at: new Date().toISOString()
        }
      });
    
    return Response.json({ 
      success: true, 
      message: `Welcome email sent to ${userProfile.email}`,
      email_id: data?.id
    });

  } catch (error) {
    console.error('Welcome email loader error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};