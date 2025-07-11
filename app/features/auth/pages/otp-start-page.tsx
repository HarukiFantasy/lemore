import { Form, Link, redirect, useNavigation } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../common/components/ui/tabs";
import { AnimatedGradientText } from 'components/magicui/animated-gradient-text';
import { Route } from './+types/otp-start-page';
import { makeSSRClient } from '~/supa-client';
import { z } from 'zod';
import { LoaderCircle, Mail, Phone } from 'lucide-react';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Login with OTP" },
    { name: "description", content: "Login with OTP using email or phone" },
  ];
};

const emailFormSchema = z.object({
  email: z.string().email(),
  type: z.literal("email"),
});

const phoneFormSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  type: z.literal("phone"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  // Determine which form was submitted based on the type field
  const type = data.type as string;
  
  if (type === "email") {
    const { success, data: parsedData } = emailFormSchema.safeParse(data);
    if (!success) {
      return { error: "Invalid email address" };
    }
    const { email } = parsedData;
    const { client } = makeSSRClient(request);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) { 
      return {error: "Failed to send OTP"} 
    }
    return redirect(`/auth/otp/complete?email=${email}`);
  } else if (type === "phone") {
    const { success, data: parsedData } = phoneFormSchema.safeParse(data);
    if (!success) {
      return { error: "Invalid phone number" };
    }
    let { phone } = parsedData;

    const { client } = makeSSRClient(request);
    const { error } = await client.auth.signInWithOtp({
      phone,
    });
    if (error) { 
      console.error('SMS OTP Error:', error);
      return {error: `Failed to send SMS OTP: ${error.message}`} 
    }
    return redirect(`/auth/otp/complete?phone=${phone}`);
  }
  
  return { error: "Invalid form submission" };
};

export default function OtpStartPage({actionData}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login with OTP</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred method to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="mt-4">
              <Form method="post" className="space-y-4">
                <input type="hidden" name="type" value="email" />
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <Button className="w-full cursor-pointer" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Send Email OTP"
                  )}
                </Button>
              </Form>
            </TabsContent>
            
            <TabsContent value="phone" className="mt-4">
              <Form method="post" className="space-y-4">
                <input type="hidden" name="type" value="phone" />
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <Button className="w-full cursor-pointer" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Send SMS OTP"
                  )}
                </Button>
              </Form>
            </TabsContent>
          </Tabs>
          
          {actionData && "error" in actionData && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {(actionData as {error: string}).error}
            </p>
          )}
          
          <div className="mt-4 text-center text-sm">
            <Link to="/auth/login" className="text-primary hover:underline">
              <AnimatedGradientText>Sign in with email</AnimatedGradientText>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
