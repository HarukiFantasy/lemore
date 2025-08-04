import { declutterSituations, recommendationActions } from "~/schema";

// UI 전용 상수들
export const DECLUTTER_SITUATIONS = [
  { value: "Moving", label: "Moving" },
  { value: "Minimalism", label: "Minimalism" },
  { value: "Spring Cleaning", label: "Spring Cleaning" },
  { value: "Other", label: "Other" }
] as const;

// Decision-focused questions based on JTBD framework
export const DECISION_QUESTIONS = [
  {
    question: "When was the last time you used this item?",
    purpose: "usage_frequency",
    options: [
      { label: "Within the past month", value: "recent", weight: 3 },
      { label: "Within the past 6 months", value: "moderate", weight: 2 },
      { label: "Over a year ago", value: "rare", weight: 1 },
      { label: "I can't remember", value: "never", weight: 0 }
    ]
  },
  {
    question: "If this item disappeared tomorrow, how would you feel?",
    purpose: "emotional_attachment",
    options: [
      { label: "I'd be devastated and need to replace it", value: "essential", weight: 3 },
      { label: "I'd be upset but could manage", value: "attached", weight: 2 },
      { label: "I'd notice but wouldn't be bothered", value: "neutral", weight: 1 },
      { label: "I probably wouldn't notice for weeks", value: "detached", weight: 0 }
    ]
  },
  {
    question: "What's your main reason for keeping this item?",
    purpose: "keeping_motivation",
    options: [
      { label: "I use it regularly and it's important", value: "practical", weight: 3 },
      { label: "It has sentimental value", value: "sentimental", weight: 2 },
      { label: "I might need it someday", value: "maybe", weight: 1 },
      { label: "I haven't thought about it", value: "default", weight: 0 }
    ]
  },
  {
    question: "How does having this item make you feel about your space?",
    purpose: "space_impact",
    options: [
      { label: "It makes my space feel complete and organized", value: "positive", weight: 3 },
      { label: "It's neutral - doesn't affect the space much", value: "neutral", weight: 2 },
      { label: "It adds some clutter but I don't mind", value: "slight_negative", weight: 1 },  
      { label: "It makes my space feel crowded or messy", value: "negative", weight: 0 }
    ]
  },
  {
    question: "If someone you cared about could benefit from this item, would you...?",
    purpose: "sharing_willingness",
    options: [
      { label: "Keep it because I need it more", value: "keep", weight: 0 },
      { label: "Feel conflicted but probably keep it", value: "conflicted", weight: 1 },
      { label: "Consider giving it if they really needed it", value: "consider", weight: 2 },
      { label: "Happily give it to them", value: "give", weight: 3 }
    ]
  }
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
