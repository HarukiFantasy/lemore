import type { Route } from "./+types/let-go-buddy-page";
import { Button } from "~/common/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { CameraIcon, ExclamationTriangleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { makeSSRClient } from "~/supa-client";
import { getLetGoSessionsCount } from "../queries";
import { redirect } from "react-router";
import { createLetGoBuddySession } from "../mutations";

const MAX_FREE_SESSIONS = 2;

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  
  const sessionCount = await getLetGoSessionsCount(client, user.id);
  
  return {
    sessionCount,
    hasReachedLimit: sessionCount >= MAX_FREE_SESSIONS
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "start-session") {
    // Check session count first
    const sessionCount = await getLetGoSessionsCount(client, user.id);
    if (sessionCount >= MAX_FREE_SESSIONS) {
      return { error: "You've reached the maximum number of free sessions" };
    }
    
    // Create new session
    const sessionId = await createLetGoBuddySession(client, user.id);
    return redirect(`/let-go-buddy/chat/${sessionId}`);
  }
  
  return null;
}

export default function LetGoBuddyPage({ loaderData }: Route.ComponentProps) {
  const { sessionCount, hasReachedLimit } = loaderData;
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-900">Let Go Buddy</h1>
        </div>
        <p className="text-xl text-gray-600 mb-6">
          Your AI decluttering companion. Get personalized guidance to make confident decisions about your belongings.
        </p>
        
        {/* Usage Counter */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant={hasReachedLimit ? "destructive" : "secondary"} className="text-sm">
            {sessionCount}/{MAX_FREE_SESSIONS} Free Sessions Used
          </Badge>
        </div>
      </div>

      {/* Main Action Card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Start Your Decluttering Journey</CardTitle>
          <p className="text-gray-600">
            Upload a photo of an item you're considering letting go, and I'll help you make the right decision.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {hasReachedLimit ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
                <ExclamationTriangleIcon className="w-6 h-6" />
                <p className="font-medium">Free session limit reached</p>
              </div>
              <p className="text-gray-600 mb-6">
                You've used all {MAX_FREE_SESSIONS} of your free Let Go Buddy sessions. 
                Consider upgrading to continue your decluttering journey!
              </p>
              <Button disabled className="bg-gray-300 cursor-not-allowed">
                <CameraIcon className="w-5 h-5 mr-2" />
                Upload Photo (Premium Feature)
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-800 space-y-1 text-left max-w-md mx-auto">
                  <li>1. Upload a photo of your item</li>
                  <li>2. Chat with Joy, your AI decluttering coach</li>
                  <li>3. Get personalized recommendations</li>
                  <li>4. Choose to sell, donate, or add to your challenge calendar</li>
                </ol>
              </div>
              
              <form method="post">
                <input type="hidden" name="intent" value="start-session" />
                <Button type="submit" size="lg" className="bg-[#91a453] text-[#fcffe7] hover:bg-[#D4DE95] hover:text-[#3D4127] cursor-pointer">
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Start New Session
                </Button>
              </form>
              
              <p className="text-sm text-gray-500 mt-4">
                {MAX_FREE_SESSIONS - sessionCount} free session{MAX_FREE_SESSIONS - sessionCount !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <SparklesIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-gray-600">
              Get insights into your emotional attachment and usage patterns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CameraIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Photo-Based Sessions</h3>
            <p className="text-sm text-gray-600">
              Simply upload a photo to start your decluttering conversation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">Joy</span>
            </div>
            <h3 className="font-semibold mb-2">Personal Coach</h3>
            <p className="text-sm text-gray-600">
              Chat with Joy, your empathetic AI decluttering companion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {sessionCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{sessionCount}</p>
                <p className="text-sm text-gray-600">Sessions Completed</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ready for more?</p>
                <p className="text-sm text-blue-600">
                  {hasReachedLimit ? "Upgrade to continue" : "Keep decluttering!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}