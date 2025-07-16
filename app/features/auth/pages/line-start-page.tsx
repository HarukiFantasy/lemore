import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

const LINE_CLIENT_ID = process.env.LINE_CLIENT_ID || '';
const REDIRECT_URI = process.env.LINE_REDIRECT_URI || 'http://localhost:5173/auth/line/complete';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Line OAuth URL 생성
  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', LINE_CLIENT_ID);
  lineAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  lineAuthUrl.searchParams.set('state', 'line_auth_state'); // CSRF 보호용
  lineAuthUrl.searchParams.set('scope', 'profile openid');
  
  return redirect(lineAuthUrl.toString());
};

export default function LineStartPage() {
  return null; // loader에서 리다이렉트되므로 컴포넌트는 렌더링되지 않음
} 