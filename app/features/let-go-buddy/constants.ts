import { declutterSituations, recommendationActions, environmentalImpactLevels } from "~/schema";

// UI 전용 상수들
export const DECLUTTER_SITUATIONS = [
  { value: "moving", label: "Moving" },
  { value: "downsizing", label: "Downsizing" },
  { value: "spring_cleaning", label: "Spring Cleaning" },
  { value: "digital_declutter", label: "Digital Declutter" },
  { value: "minimalism", label: "Minimalism" },
  { value: "inheritance", label: "Inheritance" },
  { value: "relationship_change", label: "Relationship Change" },
  { value: "other", label: "Other" }
] as const;

export const EMOTIONAL_QUESTIONS = [
  "How attached are you to this item?",
  "How often do you use this item?",
  "Does this item bring you joy?",
  "Would you miss this item if it were gone?",
  "Does this item represent a memory or milestone?"
] as const;

export const ENVIRONMENTAL_IMPACT = [
  { level: "low", description: "Minimal environmental impact", color: "text-green-600" },
  { level: "medium", description: "Moderate environmental impact", color: "text-yellow-600" },
  { level: "high", description: "High environmental impact", color: "text-orange-600" },
  { level: "critical", description: "Critical environmental impact", color: "text-red-600" }
] as const;

// 타입 정의
export type DeclutterSituation = typeof declutterSituations.enumValues[number];
export type RecommendationAction = typeof recommendationActions.enumValues[number];
export type EnvironmentalImpactLevel = typeof environmentalImpactLevels.enumValues[number]; 