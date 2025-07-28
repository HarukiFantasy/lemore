// api/send-welcome-email.ts

import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Supabase webhook payload structure
  const { type, record } = req.body;

  if (type !== 'INSERT' || !record) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const { email, username } = record;

  if (!email || !username) {
    return res.status(400).json({ error: 'Missing email or username in webhook record' });
  }

  // TODO: Implement actual email sending logic here
  // For example, using a library like Resend or Nodemailer
  console.log(`Sending welcome email to: ${email} (username: ${username})`);

  // Simulate success
  return res.status(200).json({ success: true, message: `Welcome email queued for ${email}` });
} 