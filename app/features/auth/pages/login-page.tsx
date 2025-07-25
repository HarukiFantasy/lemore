import { Form, Link, useNavigation } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { AnimatedGradientText } from "components/magicui/animated-gradient-text";
import { Route } from './+types/login-page';
import { CircleIcon } from 'lucide-react';
import { z } from 'zod';
import { makeSSRClient } from '~/supa-client';
import { redirect } from "react-router";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Login | LE:MORE" },
    { name: "description", content: "Login to your account" },
  ];
};

const formSchema = z.object({
  email: z.string({required_error: "Email is required"}).email("Invalid email address"),
  password: z.string({required_error: "Password is required"}).min(8, "Password must be at least 8 characters"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(Object.fromEntries(formData));
  if(!success) {
    return { 
      loginError: null,
      formErrors: error.flatten().fieldErrors, 
    };
  };
  const { email, password } = data;
  const { client, headers } = makeSSRClient(request);
  const { error: loginError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (loginError) {
    return { 
      formErrors: null,
      loginError: loginError.message,
    };
  }
  return redirect("/", { headers });
};



export default function LoginPage({actionData}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
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
                placeholder="Enter your password"
                required
              />
              {actionData && "formErrors" in actionData && (
                <p className="text-red-500 text-sm italic">{actionData?.formErrors?.password?.join(", ")}</p>
              )}
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? <CircleIcon className="animate-spin" /> : "Log in"}
            </Button>
            {actionData && "loginError" in actionData && (
              <p className="text-red-500 text-sm italic">{actionData.loginError}</p>
            )}
          </Form>
          
          {/* Alternative Login Options */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* 3개 버튼을 한 줄에 균등하게 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {/* <Button variant="outline" asChild>
                <Link to="/auth/otp/start">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  OTP Login
                </Link>
              </Button> */}
              <Button variant="outline" asChild>
                <Link to="/auth/social/google/start">
                  <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/auth/social/facebook/start">
                  <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/auth/social/line/start">
                  <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                  </svg>
                  <span>Line</span>
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/auth/join" className="hover:underline text-primary">
              <AnimatedGradientText>Sign up</AnimatedGradientText>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}