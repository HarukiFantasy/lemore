// User Roles
export const USER_ROLES = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
  { value: "super_admin", label: "Super Administrator" },
] as const;

// User Statuses
export const USER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
  { value: "pending", label: "Pending" },
] as const;

// Verification Statuses
export const VERIFICATION_STATUSES = [
  { value: "unverified", label: "Unverified" },
  { value: "pending", label: "Pending Verification" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  { value: "message", label: "Message" },
  { value: "like", label: "Like" },
  { value: "follow", label: "Follow" },
  { value: "system", label: "System" },
  { value: "sale", label: "Sale" },
  { value: "review", label: "Review" },
  { value: "price_drop", label: "Price Drop" },
  { value: "security", label: "Security Alert" },
  { value: "verification", label: "Verification" },
  { value: "marketing", label: "Marketing" },
] as const;

// Preference Categories
export const PREFERENCE_CATEGORIES = [
  { value: "notifications", label: "Notifications" },
  { value: "privacy", label: "Privacy" },
  { value: "display", label: "Display" },
  { value: "language", label: "Language" },
  { value: "currency", label: "Currency" },
  { value: "timezone", label: "Timezone" },
  { value: "security", label: "Security" },
  { value: "marketing", label: "Marketing" },
] as const;

// User Activity Actions
export const USER_ACTIONS = [
  "login",
  "logout",
  "register",
  "profile_update",
  "password_change",
  "email_verification",
  "phone_verification",
  "listing_create",
  "listing_update",
  "listing_delete",
  "message_send",
  "message_receive",
  "review_post",
  "review_receive",
  "purchase_made",
  "sale_completed",
  "preference_update",
  "security_setting_change",
  "privacy_setting_change",
] as const;

// Resource Types for Activity Logs
export const RESOURCE_TYPES = [
  "profile",
  "listing",
  "message",
  "review",
  "transaction",
  "notification",
  "preference",
  "security_setting",
  "privacy_setting",
] as const;

// Verification Types
export const VERIFICATION_TYPES = [
  "email",
  "phone",
  "identity",
  "address",
  "payment_method",
] as const;

// Two-Factor Authentication Methods
export const TWO_FACTOR_METHODS = [
  "sms",
  "email",
  "app",
  "backup_codes",
] as const;

// Profile Visibility Options
export const PROFILE_VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "friends", label: "Friends Only" },
  { value: "private", label: "Private" },
] as const;

// Gender Options
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

// Language Options
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "th", label: "ไทย" },
  { value: "ko", label: "한국어" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
] as const;

// Currency Options
export const CURRENCY_OPTIONS = [
  { value: "THB", label: "Thai Baht (฿)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "KRW", label: "Korean Won (₩)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
] as const;

// Timezone Options (Common ones)
export const TIMEZONE_OPTIONS = [
  { value: "Asia/Bangkok", label: "Bangkok (GMT+7)" },
  { value: "Asia/Seoul", label: "Seoul (GMT+9)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
  { value: "Asia/Shanghai", label: "Shanghai (GMT+8)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "Europe/London", label: "London (GMT+0)" },
] as const;

// Notification Priority Levels
export const NOTIFICATION_PRIORITIES = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
] as const;

// Security Settings
export const SECURITY_SETTINGS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE: true,
    LOWERCASE: true,
    NUMBERS: true,
    SPECIAL_CHARS: true,
  },
  SESSION_TIMEOUT_MINUTES: 60,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
} as const;

// User Statistics Defaults
export const USER_STATISTICS_DEFAULTS = {
  TOTAL_LISTINGS: 0,
  ACTIVE_LISTINGS: 0,
  SOLD_ITEMS: 0,
  TOTAL_SALES: "0.00",
  TOTAL_PURCHASES: 0,
  TOTAL_SPENT: "0.00",
  POSITIVE_REVIEWS: 0,
  NEGATIVE_REVIEWS: 0,
} as const;

// Social Media Platforms
export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "tiktok",
  "line",
  "kakao",
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
export type UserStatus = typeof USER_STATUSES[number]["value"];
export type VerificationStatus = typeof VERIFICATION_STATUSES[number]["value"];
export type NotificationType = typeof NOTIFICATION_TYPES[number]["value"];
export type PreferenceCategory = typeof PREFERENCE_CATEGORIES[number]["value"];
export type UserAction = typeof USER_ACTIONS[number];
export type ResourceType = typeof RESOURCE_TYPES[number];
export type VerificationType = typeof VERIFICATION_TYPES[number];
export type TwoFactorMethod = typeof TWO_FACTOR_METHODS[number];
export type ProfileVisibility = typeof PROFILE_VISIBILITY_OPTIONS[number]["value"];
export type Gender = typeof GENDER_OPTIONS[number]["value"];
export type Language = typeof LANGUAGE_OPTIONS[number]["value"];
export type Currency = typeof CURRENCY_OPTIONS[number]["value"];
export type Timezone = typeof TIMEZONE_OPTIONS[number]["value"];
export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[number]["value"];
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];
