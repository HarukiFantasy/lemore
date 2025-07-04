import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { useRouteError, isRouteErrorResponse } from "react-router";
import { z } from "zod";

// Mock user settings function (임시)
async function fetchMockUserSettings(userId: string) {
  return {
    success: true,
    settings: {
      notifications: {
        email: "all" as const,
        push: "important" as const,
        marketing: true,
        updates: true,
      },
      privacy: {
        profileVisibility: "public" as const,
        contactInfo: "buyers" as const,
        locationSharing: "city" as const,
        showOnlineStatus: true,
      },
      preferences: {
        language: "en" as const,
        timezone: "pst" as const,
        currency: "USD" as const,
        dateFormat: "MM/DD/YYYY" as const,
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 60,
      },
    }
  };
}

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
      console.error("Settings loader: Failed to fetch user settings");
      throw new Response("Failed to load settings", { 
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
      </div>
    </div>
  );
} 