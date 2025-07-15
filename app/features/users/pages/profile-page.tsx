import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import type { Route } from "./+types/profile-page";
import { makeSSRClient } from "~/supa-client";
import { getUserByProfileId } from "../queries";
import { redirect, useNavigation, useActionData } from 'react-router';
import { LOCATIONS, type Location } from "~/constants";
import { CircleIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export const loader = async ({request}: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: {user} } = await client.auth.getUser();
  if (user) {
    const userProfile = await getUserByProfileId(client, { profileId: user?.id ?? null });
    return { userProfile };
  }
  return redirect('/auth/login');
};

export const action = async ({request}: Route.ActionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const bio = formData.get("bio");
  const location = formData.get("location");
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  
  // Validate location is one of the allowed values
  if (location && !LOCATIONS.includes(location as Location)) {
    return { error: "Invalid location selected" };
  }
  
  const { error } = await client.from("user_profiles").update({
    username: username as string,
    email: email as string,
    bio: bio as string,
    location: location as Location,
    updated_at: new Date().toISOString(),
  }).eq("profile_id", user.id);
  
  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
  
  return { success: true };
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) { 
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting" ;
  const { userProfile } = loaderData;
  const [selectedLocation, setSelectedLocation] = useState(userProfile?.location || "");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  useEffect(() => {
    if (actionData) {
      if ('success' in actionData) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else if ('error' in actionData) {
        setMessage({ type: 'error', text: actionData.error });
      }
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  }, [actionData]);
  
  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and preferences.</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircleIcon className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {userProfile?.username?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{userProfile?.username}</CardTitle>
              <CardDescription>Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userProfile?.total_listings}</div>
                  <div className="text-sm text-gray-500">Total Listings</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProfile?.total_likes}</div>
                  <div className="text-sm text-gray-500">Total Likes</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userProfile?.total_views}</div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form method="post">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">User Name</label>
                      <Input 
                        name="username"
                        defaultValue={userProfile?.username || ""}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <Input 
                        name="email"
                        type="email"
                        defaultValue={userProfile?.email || ""}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <Input 
                      name="bio"
                      defaultValue={userProfile?.bio || ""}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="location" value={selectedLocation} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className='cursor-pointer' disabled={isSubmitting}>
                      {isSubmitting ? <CircleIcon className="animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 