// api/send-welcome-email.ts

import type { Request, Response } from 'express';


export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username } = req.body;
  if (!email || !username) {
    return res.status(400).json({ error: 'Missing email or username' });
  }

  // TODO: Implement actual email sending logic here
  console.log('Send welcome email to:', email, 'username:', username);

  // Simulate success
  return res.status(200).json({ success: true });
} 