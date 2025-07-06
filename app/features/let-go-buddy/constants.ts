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


export const RECOMMENDATION_ACTIONS = [
  {
    label: "Sell",
    value: "sell",
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

export const EMOTIONAL_QUESTIONS = [
  "When was the last time you used this item?",
  "Does this item remind you of a special memory?",
  "Would you buy this item again if you lost it?",
  "Do you feel guilty about getting rid of it?",
  "Does this item represent who you are or want to be?",
] as const;


// Environmental impact data
export const ENVIRONMENTAL_IMPACT: Record<string, { co2: number; landfill: string; recyclable: boolean }> = {
  "Electronics": { co2: 25, landfill: "High", recyclable: true },
  "Clothing": { co2: 15, landfill: "Medium", recyclable: true },
  "Books": { co2: 5, landfill: "Low", recyclable: true },
  "Furniture": { co2: 30, landfill: "High", recyclable: false },
  "Kitchen Items": { co2: 10, landfill: "Medium", recyclable: true },
};