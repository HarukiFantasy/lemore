import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Separator } from "../../../common/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../../common/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { useRouteError, isRouteErrorResponse } from "react-router";
import { fetchMockUserSettings } from "../queries";
import { z } from "zod";

// Settings loader data schema
const settingsLoaderDataSchema = z.object({
  settings: z.object({
    notifications: z.object({
      email: z.enum(["all", "important", "none"]),
      push: z.enum(["all", "important", "none"]),
      marketing: z.boolean(),
      updates: z.boolean(),
    }),
    privacy: z.object({
      profileVisibility: z.enum(["public", "friends", "private"]),
      contactInfo: z.enum(["everyone", "buyers", "verified"]),
      locationSharing: z.enum(["city", "region", "none"]),
      showOnlineStatus: z.boolean(),
    }),
    preferences: z.object({
      language: z.enum(["en", "es", "fr", "de"]),
      timezone: z.enum(["pst", "est", "cst", "mst", "gmt"]),
      currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
      dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
    }),
    security: z.object({
      twoFactorEnabled: z.boolean(),
      loginNotifications: z.boolean(),
      sessionTimeout: z.number(),
    }),
  }),
});

type SettingsLoaderData = z.infer<typeof settingsLoaderDataSchema>;

// Loader function
export const loader = async ({ request }: { request: Request }) => {
  try {
    // 실제 환경에서는 사용자 ID를 세션이나 토큰에서 가져와야 함
    const userId = "current-user"; // 임시 사용자 ID
    
    console.log("Settings loader: Starting to fetch user settings for userId:", userId);
    
    // 개발 환경에서는 mock 데이터 사용
    const result = await fetchMockUserSettings(userId);
    
    console.log("Settings loader: Mock data result:", result);
    
    if (!result.success) {
      console.error("Settings loader: Failed to fetch user settings:", result.errors);
      throw new Response(result.errors?.join(", ") || "Failed to load settings", { 
        status: 500,
        statusText: "Failed to load settings"
      });
    }

    const loaderData: SettingsLoaderData = {
      settings: result.settings!
    };

    console.log("Settings loader: Prepared loader data:", loaderData);

    // Zod를 사용한 데이터 검증
    const validationResult = settingsLoaderDataSchema.safeParse(loaderData);
    
    if (!validationResult.success) {
      console.error("Settings loader: Validation failed:", validationResult.error.errors);
      const errorMessage = validationResult.error.errors.map(err => err.message).join(", ");
      throw new Response(`Data validation failed: ${errorMessage}`, { 
        status: 500,
        statusText: "Invalid settings data"
      });
    }

    console.log("Settings loader: Validation successful, returning data");
    return validationResult.data;

  } catch (error) {
    console.error("Settings loader error:", error);
    
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
  let details = "An unexpected error occurred while loading your settings.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      message = "Invalid Request";
      details = "The request was invalid. Please try again.";
    } else if (error.status === 404) {
      message = "Settings Not Found";
      details = "The requested settings could not be found.";
    } else if (error.status === 500) {
      message = "Server Error";
      details = "There was a problem loading your settings. Please try again later.";
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

export default function SettingsPage({ loaderData }: { loaderData: SettingsLoaderData }) {
  const { settings } = loaderData;

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Customize your account settings and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information and security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <Input id="currentPassword" type="password" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <Input id="newPassword" type="password" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <Input id="confirmPassword" type="password" />
            </div>
            <div className="flex justify-end">
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Choose how and when you want to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <RadioGroup defaultValue={settings.notifications.email} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="email-all" />
                    <label htmlFor="email-all" className="text-sm">All</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="important" id="email-important" />
                    <label htmlFor="email-important" className="text-sm">Important Only</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="email-none" />
                    <label htmlFor="email-none" className="text-sm">None</label>
                  </div>
                </RadioGroup>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications on your device</p>
                </div>
                <RadioGroup defaultValue={settings.notifications.push} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="push-all" />
                    <label htmlFor="push-all" className="text-sm">All</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="important" id="push-important" />
                    <label htmlFor="push-important" className="text-sm">Important Only</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="push-none" />
                    <label htmlFor="push-none" className="text-sm">None</label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control your privacy and data sharing preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-gray-500">Who can see your profile information</p>
                </div>
                <Select defaultValue={settings.privacy.profileVisibility}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Contact Information</h4>
                  <p className="text-sm text-gray-500">Who can contact you directly</p>
                </div>
                <Select defaultValue={settings.privacy.contactInfo}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="buyers">Buyers Only</SelectItem>
                    <SelectItem value="verified">Verified Users Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Location Sharing</h4>
                  <p className="text-sm text-gray-500">Share your general location with other users</p>
                </div>
                <RadioGroup defaultValue={settings.privacy.locationSharing} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="city" id="location-city" />
                    <label htmlFor="location-city" className="text-sm">City Only</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="region" id="location-region" />
                    <label htmlFor="location-region" className="text-sm">Region</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="location-none" />
                    <label htmlFor="location-none" className="text-sm">None</label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
            <CardDescription>Set your preferred language and regional settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <Select defaultValue={settings.preferences.language}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <Select defaultValue={settings.preferences.timezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                    <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 