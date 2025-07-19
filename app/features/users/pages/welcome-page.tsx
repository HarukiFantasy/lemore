import { Resend } from "resend";
import { Route } from './+types/welcome-page';
import { LemoreWelcomeEmail } from 'react-email-starter/emails/welcome-user';
import { makeSSRClient } from '~/supa-client';

const client = new Resend(process.env.RESEND_API_KEY);

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { client: supabaseClient } = makeSSRClient(request);
  
  // Get email from database using username
  const { data: user, error: userError } = await supabaseClient
    .from('user_profiles')
    .select('email')
    .eq('username', params.username)
    .single();

  if (userError || !user?.email) {
    return Response.json({ error: "User or email not found" }, { status: 404 });
  }

  const { data, error } = await client.emails.send({
    from: "Sena <sena@mail.lemore.life>",
    to: user.email,
    subject: "Welcome to Lemore",
    react: <LemoreWelcomeEmail username={params.username} />,
  });
  
  return Response.json({ data, error });
};