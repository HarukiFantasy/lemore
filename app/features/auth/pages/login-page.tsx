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
          <div className="mt-4 px-8 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link to="/terms-of-service" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </div>
          
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
            
            <div className="grid grid-cols-2 gap-2">
                            {/* <Button variant="outline" asChild>
                <Link to="/auth/otp/start">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  OTP Login
                </Link>
              </Button> */}
              <Button variant="outline" asChild className="hover:bg-blue-50 hover:border-blue-300">
                <Link to="/auth/social/google/start" className="flex items-center">
                  <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="hover:bg-blue-50 hover:border-blue-300">
                <Link to="/auth/social/facebook/start" className="flex items-center">
                  <svg className="mr-1 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="hover:bg-green-50 hover:border-green-300">
                <Link to="/auth/social/line/start" className="flex items-center">
                  <svg className="mr-1 w-4 h-4" viewBox="0 0 512 512">
                    <rect width="512" height="512" rx="15%" fill="#00B900"/>
                    <path d="m443 231c-2 45-21 76-51 103-53 47-137 105-148 96-11-14 21-47-20-52-88-12-155-74-155-147 0-82 85-150 188-150s189 68 186 150z" fill="#fff"/>
                    <path d="m371 232h-34m34-36h-36v72h36m-123 0v-72l54 72v-72m-89 72v-72m-66 0v72h37" fill="none" stroke="#00B900" strokeLinecap="round" strokeLinejoin="round" strokeWidth="21"/>
                  </svg>
                  <span>Line</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="hover:bg-yellow-50 hover:border-yellow-300">
                <Link to="/auth/social/kakao/start" className="flex items-center">
                  <svg className="mr-1 w-4 h-4" viewBox="0 0 100 100">
                    <path fill="#3D1D1C" d="M50.208,7.556C6.123,7.324-14.318,53.867,25.774,74.543c-0.705,2.429-4.527,15.63-4.68,16.667c-0.109,0.811,0.509,1.491,1.511,1.143C24.053,92.15,39.385,81.38,42.039,79.51C105.612,87.119,118.13,10.476,50.208,7.556z"/>
                    <path fill="#FFE812" d="M27.433,53.943c-0.086,3.333-5.216,3.346-5.307,0c0,0,0-15.763,0-15.763h-4.14c-3.429-0.087-3.436-5.107,0-5.196c0,0,13.587,0,13.587,0c3.431,0.091,3.435,5.105,0,5.196c0,0-4.14,0-4.14,0V53.943z"/>
                    <path fill="#FFE812" d="M49.733,56.076c-1.191,0.628-3.495,0.475-3.895-0.806c0,0-1.314-3.44-1.314-3.44l-8.091,0l-1.315,3.442c-0.398,1.279-2.703,1.433-3.893,0.804c-0.732-0.337-1.435-1.265-0.629-3.768l6.347-16.705c1.299-3.426,5.766-3.441,7.073,0.003c0,0,6.344,16.698,6.344,16.698C51.167,54.812,50.464,55.74,49.733,56.076z"/>
                    <path fill="#FFE812" d="M63.143,56.09H54.63c-1.402,0-2.543-1.091-2.543-2.432V35.637c0.091-3.492,5.324-3.503,5.417,0c0,0,0,15.588,0,15.588h5.639C66.492,51.308,66.499,56.005,63.143,56.09z"/>
                    <path fill="#FFE812" d="M83.914,54.092c-0.236,2.275-3.433,3.113-4.745,1.231c0,0-6.222-8.245-6.222-8.245l-0.921,0.921v5.789c-0.087,3.492-5.216,3.505-5.308,0.001c0,0,0-18.152,0-18.152c0.092-3.495,5.213-3.502,5.307,0c0,0,0,5.703,0,5.703l7.403-7.403c0.888-0.901,2.432-0.707,3.298,0.193c0.901,0.856,1.096,2.418,0.195,3.298l-6.047,6.046l6.531,8.653C83.83,52.687,84.013,53.395,83.914,54.092z"/>
                    <polygon fill="#3D1D1C" points="37.829,47.131 43.129,47.131 40.479,39.602"/>
                  </svg>
                  <span>Kakao</span>
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