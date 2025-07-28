// api/send-welcome-email.ts
import { Resend } from 'resend';
import WelcomeEmail from '../../react-email-starter/emails/welcome-user';
import type { Request, Response } from 'express';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, record } = req.body;

  if (type !== 'INSERT' || !record) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const { email, username } = record;

  if (!email || !username) {
    return res.status(400).json({ error: 'Missing email or username in webhook record' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Lemore <welcome@mail.lemore.life>',
      to: [email],
      subject: 'Welcome to Lemore!',
      react: WelcomeEmail({ username }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Welcome email sent successfully:', data);
    return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
} 