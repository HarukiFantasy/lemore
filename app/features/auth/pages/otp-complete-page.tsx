import { Form, Link } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";

export default function OtpCompletePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Enter verification code</CardTitle>
          <CardDescription className="text-center">
            We've sent a code to your phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Verify code
            </Button>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link to="/auth/otp/start" className="text-primary hover:underline">
              Resend code
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
