export const DECLUTTER_SITUATIONS = [
  {
    label: "I'm moving soon",
    value: "moving",
  },
  {
    label: "I need more space",
    value: "need-space",
  },
  {
    label: "I'm just tidying up",
    value: "tidying",
  },
  {
    label: "I'm downsizing",
    value: "downsizing",
  },
  {
    label: "I'm going minimalist",
    value: "minimalist",
  },
] as const;

export const ITEM_CATEGORIES = [
  {
    label: "Electronics",
    value: "electronics",
  },
  {
    label: "Clothing",
    value: "clothing",
  },
  {
    label: "Books",
    value: "books",
  },
  {
    label: "Furniture",
    value: "furniture",
  },
  {
    label: "Kitchen Items",
    value: "kitchen",
  },
  {
    label: "Home Decor",
    value: "home-decor",
  },
  {
    label: "Sports Equipment",
    value: "sports",
  },
  {
    label: "Toys & Games",
    value: "toys",
  },
  {
    label: "Jewelry & Accessories",
    value: "jewelry",
  },
  {
    label: "Other",
    value: "other",
  },
] as const;

export const RECOMMENDATION_ACTIONS = [
  {
    label: "Donate",
    value: "donate",
  },
  {
    label: "Sell",
    value: "sell",
  },
  {
    label: "Recycle",
    value: "recycle",
  },
  {
    label: "Repair",
    value: "repair",
  },
  {
    label: "Keep",
    value: "keep",
  },
  {
    label: "Give Away",
    value: "give-away",
  },
] as const;

export const ITEM_CONDITIONS = [
  {
    label: "New",
    value: "new",
  },
  {
    label: "Like New",
    value: "like-new",
  },
  {
    label: "Excellent",
    value: "excellent",
  },
  {
    label: "Good",
    value: "good",
  },
  {
    label: "Fair",
    value: "fair",
  },
  {
    label: "Poor",
    value: "poor",
  },
] as const;

export const EMOTIONAL_ATTACHMENT_LEVELS = [
  {
    label: "Very Low",
    value: 1,
  },
  {
    label: "Low",
    value: 2,
  },
  {
    label: "Medium",
    value: 3,
  },
  {
    label: "High",
    value: 4,
  },
  {
    label: "Very High",
    value: 5,
  },
] as const;

export const ENVIRONMENTAL_IMPACT_LEVELS = [
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "High",
    value: "high",
  },
] as const;

export const DECLUTTER_PLANS = [
  {
    day: 1,
    title: "Organize your closet",
    description: "Sort through clothes, shoes, and accessories",
  },
  {
    day: 2,
    title: "Check your kitchen",
    description: "Review appliances, utensils, and pantry items",
  },
  {
    day: 3,
    title: "Review appliances",
    description: "Assess electronics and household appliances",
  },
  {
    day: 4,
    title: "Books & papers",
    description: "Organize books, documents, and paperwork",
  },
  {
    day: 5,
    title: "Miscellaneous items",
    description: "Handle remaining items and final cleanup",
  },
] as const;

export const EMOTIONAL_QUESTIONS = [
  "When was the last time you used this item?",
  "Does this item remind you of a special memory?",
  "Would you buy this item again if you lost it?",
  "Do you feel guilty about getting rid of it?",
  "Does this item represent who you are or want to be?",
] as const;
