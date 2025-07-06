// User Roles
export const USER_ROLES = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
  { value: "super_admin", label: "Super Administrator" },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  { value: "message", label: "Message" },
  { value: "like", label: "Like" },
  { value: "reply", label: "Reply" },
  { value: "mention", label: "Mention" },
] as const;


// User Profile Defaults
export const USER_PROFILE_DEFAULTS = {
  LANGUAGE: "en",
  CURRENCY: "THB",
  TIMEZONE: "Asia/Bangkok",
  PROFILE_VISIBILITY: "public",
  SHOW_EMAIL: false,
  SHOW_PHONE: false,
  SHOW_LOCATION: true,
  ALLOW_MESSAGES: true,
  ALLOW_FRIEND_REQUESTS: true,
  DATA_SHARING: true,
  MARKETING_EMAILS: true,
} as const;

// Type exports for TypeScript
export type UserRole = typeof USER_ROLES[number]["value"];
