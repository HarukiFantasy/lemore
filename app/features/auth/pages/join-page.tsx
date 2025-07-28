import { Form, Link, redirect, useNavigation } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { AnimatedGradientText } from "components/magicui/animated-gradient-text";
import { Route } from "./+types/join-page";
import { makeSSRClient } from "~/supa-client";
import z from 'zod';
import { checkUsernameExists } from '../queries';
import { CircleIcon } from "lucide-react";   
import { Resend } from "resend";
import { LemoreWelcomeEmail } from 'react-email-starter/emails/welcome-user';


export const meta: Route.MetaFunction = () => {
  return [
    { title: "Join | LE:MORE" },
    { name: "description", content: "Create an account" },
  ];
};

const resendClient = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const { success, data, error } = formSchema.safeParse(
      Object.fromEntries(formData)
    );
    if (!success) {
      return { formErrors: error.flatten().fieldErrors };
    }
    const { username, email, password, confirmPassword } = data;
    if (password !== confirmPassword) {
      return { formErrors: { confirmPassword: ['Passwords do not match'] } };
    }
    const usernameExists = await checkUsernameExists(request, {
      username: data.username,
    });
    if (usernameExists) {
      return {
        formErrors: { username: ['Username already exists'] },
      };
    }
    const { client, headers } = makeSSRClient(request);
    const {
      data: { user },
      error: signUpError,
    } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
      },
    });
    if (signUpError) {
      return {
        signUpError: signUpError.message,
      };
    }

    return redirect('/', { headers });
  } catch (error) {
    console.error('Join action error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { signUpError: message };
  }
};

export default function JoinPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                required
              />
              {actionData && "formErrors" in actionData && (
                <p className="text-red-500 text-sm italic">{actionData?.formErrors?.username?.join(", ")}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
              {actionData && "formErrors" in actionData && (
                <p className="text-red-500 text-sm italic">{actionData?.formErrors?.email?.join(", ")}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
              />
              {actionData && "formErrors" in actionData && (
                <p className="text-red-500 text-sm italic">{actionData?.formErrors?.password?.join(", ")}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
              />
              {actionData && "formErrors" in actionData && (
                <p className="text-red-500 text-sm italic">{actionData?.formErrors?.confirmPassword?.join(", ")}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <CircleIcon className="animate-spin" /> : "Create account"}
            </Button>
            {actionData && "signUpError" in actionData && (
              <p className="text-red-500 text-sm italic">{actionData.signUpError}</p>
            )} 
          </Form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/auth/login" className="text-primary hover:underline">
              <AnimatedGradientText>Sign in</AnimatedGradientText>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
