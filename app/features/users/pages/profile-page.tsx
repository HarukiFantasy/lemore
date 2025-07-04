import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "react-router";
import { z } from "zod";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '~/common/components/ui/select';
import { LOCATIONS } from '~/common/constants';
import { Badge } from '~/common/components/ui/badge';

// Mock user profile function (임시)
async function fetchMockUserProfile(userId: string) {
  return {
    success: true,
    user: {
      id: userId,
      username: "John Doe",
      email: "john.doe@example.com",
      avatarUrl: "/sample.png",
      bio: "Passionate about sustainable living and finding great deals on secondhand items.",
      location: "Bangkok, Thailand",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      rating: 4.8,
      responseRate: "89%",
      appreciationBadge: true,
    }
  };
}

// Profile stats schema
const profileStatsSchema = z.object({
  itemsSold: z.number().min(0, "Items sold must be non-negative"),
  averageRating: z.number().min(0).max(5, "Average rating must be between 0 and 5"),
  responseRate: z.string().regex(/^\d+%$/, "Response rate must be in percentage format (e.g., '89%')"),
});

// Profile loader data schema
const profileLoaderDataSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    avatarUrl: z.string().optional(),
    bio: z.string().optional(),
    location: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).optional(),
  stats: z.object({
    totalListings: z.number(),
    totalLikes: z.number(),
    rating: z.number(),
    responseRate: z.string().regex(/^\d+%$/, "Response rate must be in percentage format (e.g., '89%')"),
    appreciationBadge: z.boolean(),
  }),
});

type ProfileLoaderData = z.infer<typeof profileLoaderDataSchema>;

// Loader function
export const loader = async ({ request }: { request: Request }) => {
  try {
    // 실제 환경에서는 사용자 ID를 세션이나 토큰에서 가져와야 함
    const userId = "current-user"; // 임시 사용자 ID
    
    console.log("Profile loader: Starting to fetch user profile for userId:", userId);
    
    // 개발 환경에서는 mock 데이터 사용
    const result = await fetchMockUserProfile(userId);
    
    console.log("Profile loader: Mock data result:", result);
    
    if (!result.success) {
      console.error("Profile loader: Failed to fetch user profile");
      throw new Response("Failed to load profile", { 
        status: 500,
        statusText: "Failed to load profile"
      });
    }

    const loaderData: ProfileLoaderData = {
      user: result.user,
      stats: {
        totalListings: 127, // Mock data
        totalLikes: 4.8, // Mock data
        rating: 4.8, // Mock data
        responseRate: "89%", // Mock data
        appreciationBadge: true, // Mock data
      }
    };

    console.log("Profile loader: Prepared loader data:", loaderData);

    // Zod를 사용한 데이터 검증
    const validationResult = profileLoaderDataSchema.safeParse(loaderData);
    
    if (!validationResult.success) {
      console.error("Profile loader: Validation failed:", validationResult.error.errors);
      const errorMessage = validationResult.error.errors.map(err => err.message).join(", ");
      throw new Response(`Data validation failed: ${errorMessage}`, { 
        status: 500,
        statusText: "Invalid profile data"
      });
    }

    console.log("Profile loader: Validation successful, returning data");
    return validationResult.data;

  } catch (error) {
    console.error("Profile loader error:", error);
    
    if (error instanceof Response) {
      // 이미 Response 객체인 경우 그대로 던지기
      throw error;
    }
    
    if (error instanceof Error) {
      // 데이터베이스 에러인 경우 500 Internal Server Error 반환
      if (error.message.includes("Failed to fetch")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // 기타 에러는 500 Internal Server Error 반환
    throw new Response("Internal server error", { status: 500 });
  }
};

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading your profile.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      message = "Invalid Request";
      details = "The request was invalid. Please try again.";
    } else if (error.status === 404) {
      message = "Profile Not Found";
      details = "The requested profile could not be found.";
    } else if (error.status === 500) {
      message = "Server Error";
      details = "There was a problem loading your profile. Please try again later.";
    }
  }

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{message}</h1>
        <p className="text-gray-600">{details}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage({ loaderData }: { loaderData: ProfileLoaderData }) {
  const { user, stats } = loaderData;

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
                  <AvatarImage src={user?.avatarUrl || "/sample.png"} />
                  <AvatarFallback className="text-2xl">
                    {user?.username?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "JD"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user?.username || "John Doe"}</CardTitle>
              <CardDescription>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "January 2024"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalListings}</div>
                  <div className="text-sm text-gray-500">Total Listings</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-500">{stats.rating}</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.responseRate}</div>
                  <div className="text-sm text-gray-500">Response Rate</div>
                </div>
                <Separator />
                <div className="text-center">
                  <Badge variant="outline" className="text-sm bg-green-100 text-green-700 ">{stats.appreciationBadge ? "Appreciation" : "No Badge"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input id="firstName" defaultValue={user?.username?.split(' ')[0] || "John"} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input id="lastName" defaultValue={user?.username?.split(' ').slice(1).join(' ') || "Doe"} />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input 
                    id="username" 
                      defaultValue={user?.username?.toLowerCase().replace(/\s+/g, '.') || "john.doe"} 
                    placeholder="Enter your username"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your unique identifier on the platform
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input id="email" type="email" defaultValue={user?.email || "john.doe@example.com"} />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                            {LOCATIONS.map((location) => (
                                <SelectItem value={location}>{location}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={user?.bio || "Passionate about sustainable living and finding new homes for pre-loved items. Always looking for quality secondhand treasures!"}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preferences (TODO: Add preferences)
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates about your listings and messages</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-gray-500">Control who can see your profile and contact you</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Security</h4>
                    <p className="text-sm text-gray-500">Manage password and two-factor authentication</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          */}
        </div>
      </div>
    </div>
  );
} 