import { Form, Link, redirect, useNavigation } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { AnimatedGradientText } from 'components/magicui/animated-gradient-text';
import { LoaderCircle, Mail, Phone } from 'lucide-react';
import { Route } from './+types/otp-complete-page';
import { useSearchParams } from "react-router";
import { z } from 'zod';
import { makeSSRClient } from '~/supa-client';

const emailFormSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
  type: z.literal("email"),
});

const phoneFormSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().min(6).max(6),
  type: z.literal("phone"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const type = data.type as string;
  
  if (type === "email") {
    const { data: parsedData, success, error } = emailFormSchema.safeParse(data);
    if (!success) {
      return { fieldErrors: error.flatten().fieldErrors };
    }
    const { email, otp } = parsedData;
    const { client, headers } = makeSSRClient(request);
    const { error: verifyError } = await client.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (verifyError) {
      return { verifyError: verifyError.message };
    }
    return redirect("/", { headers });
  } else if (type === "phone") {
    const { data: parsedData, success, error } = phoneFormSchema.safeParse(data);
    if (!success) {
      return { fieldErrors: error.flatten().fieldErrors };
    }
    const { phone, otp } = parsedData;
    
    // 폰 OTP 검증 및 세션 생성
    const { client, headers } = makeSSRClient(request);
    
    try {
      // 폰번호로 사용자 생성 또는 로그인
      const { data: authData, error: authError } = await client.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (authError) {
        console.error('Auth error:', authError);
        return { verifyError: "Failed to authenticate: " + authError.message };
      }
      
      // 성공적으로 세션이 생성되면 홈페이지로 리다이렉트
      return redirect("/", { headers });
      
    } catch (error) {
      console.error('Session creation error:', error);
      return { verifyError: "Failed to create user session" };
    }
  }
  return { error: "Invalid form submission" };
};

export default function OtpCompletePage({actionData}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";
  
  // Determine the type and contact info
  const isPhone = !!phone;
  const contactInfo = email || phone || "";
  const type = isPhone ? "phone" : "email";
  
  // Show error if no contact info is provided
  if (!email && !phone) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-red-600">Invalid Access</CardTitle>
            <CardDescription className="text-center">
              No email or phone number provided. Please start the OTP process from the beginning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth/otp/start">
              <Button className="w-full">Go to OTP Start</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Enter verification code</CardTitle>
          <CardDescription className="text-center flex items-center justify-center gap-2">
            {isPhone ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            We've sent a code to your {isPhone ? "phone" : "email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <input type="hidden" name={isPhone ? "phone" : "email"} value={contactInfo} />
            <input type="hidden" name="type" value={type} />
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="otp"
                name="otp"
                type="number"
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                minLength={6}
              />
              {actionData && "fieldErrors" in actionData && actionData.fieldErrors?.otp && (
                <p className="text-red-500 text-sm">
                  {actionData.fieldErrors.otp.join(", ")}
                </p>
              )}
              {actionData && "verifyError" in actionData && (
                <p className="text-red-500 text-sm">
                  {actionData.verifyError}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </Button>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link to="/auth/otp/start" className="text-primary hover:underline cursor-pointer">
              <AnimatedGradientText>Resend code</AnimatedGradientText>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
