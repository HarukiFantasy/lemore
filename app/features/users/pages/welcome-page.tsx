import { LoaderFunctionArgs } from 'react-router';
import { Resend } from "resend";
import { Route } from './+types/welcome-page';
import { LemoreWelcomeEmail } from 'react-email-starter/emails/welcome-user';
import { render } from '@react-email/components';

const client = new Resend(process.env.RESEND_API_KEY);

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { data, error } = await client.emails.send({
    from: "Sena <sena@mail.lemore.life>",
    to: "senayun@gmail.com",
    subject: "Welcome to Lemore",
    react: <LemoreWelcomeEmail username={params.username} />,
  });
  return Response.json({ data, error });
};
