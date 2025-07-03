import { useParams, Link } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { AnimatedGradientText } from 'components/magicui/animated-gradient-text';

export default function SocialStartPage() {
  const { provider } = useParams();
  
  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Social";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Continue with {providerName}</CardTitle>
          <CardDescription className="text-center">
            You will be redirected to {providerName} to complete your sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <Link to={`/auth/social/${provider}/complete`}>
              Continue with {providerName}
            </Link>
          </Button>
          <div className="text-center text-sm">
            <Link to="/auth/login" className="text-primary hover:underline">
            <AnimatedGradientText>Sign in with email</AnimatedGradientText>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
