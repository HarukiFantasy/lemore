// api/send-welcome-email.ts
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { Resend } from 'resend';
import WelcomeEmail from '../../react-email-starter/emails/welcome-user';

const resend = new Resend(process.env.RESEND_API_KEY);

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { type, record } = await request.json();

    if (type !== 'INSERT' || !record) {
      return json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const { email, username } = record;

    if (!email || !username) {
      return json(
        { error: 'Missing email or username in webhook record' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Lemore <welcome@mail.lemore.life>',
      to: [email],
      subject: 'Welcome to Lemore!',
      react: WelcomeEmail({ username }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return json({ error: error.message }, { status: 400 });
    }

    console.log('Welcome email sent successfully:', data);
    return json({
      success: true,
      message: `Welcome email sent to ${email}`,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ error: errorMessage }, { status: 500 });
  }
}; 