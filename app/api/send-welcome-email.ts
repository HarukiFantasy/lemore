import { Resend } from 'resend';
import LemoreWelcomeEmail from '../../react-email-starter/emails/welcome-user';

const resend = new Resend(process.env.RESEND_API_KEY);

export const action = async ({ request }: { request: Request }) => {
  const { record } = await request.json();
  const { email, username } = record;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Lemore <welcome@mail.lemore.life>',
      to: [email],
      subject: 'Welcome to Lemore!',
      react: LemoreWelcomeEmail({ username }),
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ data }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};