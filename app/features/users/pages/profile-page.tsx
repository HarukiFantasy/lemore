import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../common/components/ui/dialog";
import type { Route } from "./+types/profile-page";
import { makeSSRClient } from "~/supa-client";
import { getUserByProfileId, getUserSalesStatsByProfileId } from "../queries";
import { updateUserAvatar } from "../mutations";
import { redirect, useNavigation, useActionData, Form, useRevalidator } from 'react-router';
import { LOCATIONS, type Location } from "~/constants";
import { Loader2, CheckCircleIcon, AlertCircleIcon, UploadIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from "../../../common/components/ui/badge";

export const loader = async ({request}: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: {user} } = await client.auth.getUser();
  if (user) {
    const userProfile = await getUserByProfileId(client, { profileId: user?.id ?? null });
    let userStats = null;
    try {
      userStats = await getUserSalesStatsByProfileId(client, user.id);
    } catch (e) {
      userStats = null;
    }
    return { userProfile, userStats };
  }
  return redirect('/auth/login');
};

export const action = async ({request}: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const bio = formData.get("bio");
  const location = formData.get("location");
  const avatar = formData.get("avatar");

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  
  // Handle avatar upload only if a valid file is provided
  if (avatar && avatar instanceof File && avatar.size > 0 && avatar.type.startsWith("image/")) {
    if (avatar.size <= 2 * 1024 * 1024) {
      try {
        const { data, error } = await client.storage
          .from("avatars")
          .upload(`${user.id}/${Date.now()}`, avatar, {
            contentType: avatar.type,
            upsert: true,
          });
        if (error) {
          return { error: "Failed to upload avatar. Please make sure the 'avatars' storage bucket exists." };
        }
        
        const {
          data: { publicUrl },
        } = await client.storage.from("avatars").getPublicUrl(data.path);
        
        await updateUserAvatar(client, {
          id: user.id,
          avatarUrl: publicUrl,
        });
      } catch (error) {
        return { error: "Failed to upload avatar. Please try again." };
      }
    } else {
      return { error: "Invalid file size or type. Please upload an image under 2MB." };
    }
  }
  
  // Validate location is one of the allowed values
  if (location && location !== "" && !LOCATIONS.includes(location as Location)) {
    return { error: "Invalid location selected" };
  }
  
  // Prepare update data
  const updateData: any = {
    username: username as string,
    email: email as string,
    bio: bio as string,
    updated_at: new Date().toISOString(),
  };
  
  // Only include location if it's not empty
  if (location && location !== "") {
    updateData.location = location as Location;
  }
  
  const { data, error } = await client.from("user_profiles").update(updateData).eq("profile_id", user.id).select();
  
  if (error) {
    return { error: "Failed to update profile" };
  }
  
  return { success: true };
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) { 
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const revalidator = useRevalidator();
  const isSubmitting = navigation.state === "submitting" ;
  const { userProfile, userStats } = loaderData;
  const [selectedLocation, setSelectedLocation] = useState(userProfile?.location || "");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    if (actionData) {
      if ('success' in actionData) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Clear file selection after successful upload
        setSelectedFile(null);
        setPreviewUrl(null);
        // Revalidate data to refresh the UI
        revalidator.revalidate();
      } else if ('error' in actionData) {
        setMessage({ type: 'error', text: actionData.error });
      }
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  }, [actionData, revalidator]);

  // navigation이 idle이 되면 Dialog를 닫음
  useEffect(() => {
    if (navigation.state === "idle") {
      setDialogOpen(false);
    }
  }, [navigation.state]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size <= 2 * 1024 * 1024 && file.type.startsWith("image/")) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setMessage({ type: 'error', text: 'Please select an image file under 2MB.' });
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };
  
  return (
    <div className="container mx-auto px-5 py-8">
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
                  <AvatarImage src={previewUrl || userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {userProfile?.username?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{userProfile?.username}</CardTitle>
              {/* Level Badge */}
              {userProfile?.level && (
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border border-purple-200">
                    {userProfile.level}
                  </Badge>
                </div>
              )}
              <CardDescription>Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats?.total_listings ?? 'N/A'}</div>
                  <div className="text-sm text-gray-500">Total Listings</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats?.sold_items ?? 'N/A'}</div>
                  <div className="text-sm text-gray-500">Sold Items</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats?.active_listings ?? 'N/A'}</div>
                  <div className="text-sm text-gray-500">Active Listings</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats?.total_sales ?? 'N/A'}</div>
                  <div className="text-sm text-gray-500">Total Sales</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{userStats?.avg_sale_price ?? 'N/A'}</div>
                  <div className="text-sm text-gray-500">Avg Sale Price</div>
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
              <Form method="post" encType="multipart/form-data">
                {/* Hidden file input inside the form - only include if file is selected */}
                {selectedFile && (
                  <input
                    name="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(input) => {
                      if (input && selectedFile) {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(selectedFile);
                        input.files = dataTransfer.files;
                      }
                    }}
                  />
                )}
                <div className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={previewUrl || userProfile?.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {userProfile?.username?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="sm" className="flex items-center space-x-2">
                                <UploadIcon className="h-4 w-4" />
                                <span>Upload Image</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Upload Profile Picture</DialogTitle>
                                <DialogDescription>
                                  Choose an image file to upload as your profile picture.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col items-center justify-center w-full">
                                <label htmlFor="avatar-upload-dialog" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">JPG, PNG, or WebP (MAX. 2MB)</p>
                                  </div>
                                  <input
                                    id="avatar-upload-dialog"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                  />
                                </label>
                                {selectedFile && (
                                  <div className="mt-4 w-full">
                                    <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-green-800">
                                          {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-green-600">
                                          {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {selectedFile && (
                            <span className="text-sm text-gray-500">
                              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, or WebP. Max 2MB.
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ File selected. Click "Save Changes" to upload.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

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
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 