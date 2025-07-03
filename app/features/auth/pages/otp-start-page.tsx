import { Form, Link } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { AnimatedGradientText } from 'components/magicui/animated-gradient-text';

export default function OtpStartPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify your phone</CardTitle>
          <CardDescription className="text-center">
            Enter your phone number to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
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
            <Button type="submit" className="w-full">
              Send verification code
            </Button>
          </Form>
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
