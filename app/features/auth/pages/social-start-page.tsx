import { redirect } from "react-router";
import z from 'zod';
import { Route } from './+types/social-start-page';
import { makeSSRClient } from '~/supa-client';

const paramSchema = z.object({
  provider: z.enum(["google", "kakao"]),
});

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramSchema.safeParse(params);
  if (!success) {
    return redirect('/auth/login');
  }
  const { provider } = data;
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
