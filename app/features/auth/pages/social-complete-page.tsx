import { useParams, Link } from "react-router";
import { Button } from "../../../common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";

export default function SocialCompletePage() {
  const { provider } = useParams();
  
  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Social";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Completing sign in</CardTitle>
          <CardDescription className="text-center">
            Please wait while we complete your {providerName} sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
          </div>
          <div className="text-center text-sm">
            <Link to="/auth/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
