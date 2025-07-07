import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";



export default function ProfilePage() {
  // Mock data for profile
  const user = {
    id: "current-user",
    username: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "/sample.png",
    bio: "Passionate about sustainable living and finding great deals on secondhand items.",
    location: "Bangkok, Thailand",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  };

  const stats = {
    totalListings: 127,
    totalLikes: 4.8,
    totalViews: 89
  };

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {user.username.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user.username}</CardTitle>
              <CardDescription>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalListings}</div>
                  <div className="text-sm text-gray-500">Total Listings</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalLikes}</div>
                  <div className="text-sm text-gray-500">Total Likes</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">User Name</label>
                    <Input 
                      defaultValue={user.username}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input 
                      type="email"
                      defaultValue={user.email}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <Input 
                    defaultValue={user.bio}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input 
                    defaultValue={user.location}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 