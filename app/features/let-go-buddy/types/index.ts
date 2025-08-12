// Let Go Buddy TypeScript Types

export type Scenario = 'A' | 'B' | 'C' | 'D' | 'E';

export type SessionStatus = 'active' | 'completed' | 'archived';
export type ItemDecision = 'keep' | 'sell' | 'donate' | 'dispose';
export type TradeMethod = 'meet' | 'ship' | 'both';
export type Language = 'en' | 'ko';
export type ChallengeStatus = 'active' | 'completed' | 'archived';

// Database Models
export interface LgbSession {
  session_id: string;
  user_id: string;
  scenario: Scenario;
  title?: string;
  move_date?: string;
  region?: string;
  trade_method?: TradeMethod;
  status: SessionStatus;
  item_count: number;
  decided_count: number;
  expected_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface LgbItem {
  item_id: string;
  session_id: string;
  title?: string;
  notes?: string;
  category?: string;
  condition?: string;
  decision?: ItemDecision;
  decision_reason?: string;
  price_low?: number;
  price_mid?: number;
  price_high?: number;
  price_confidence?: number;
  usage_score?: number;
  sentiment?: string;
  ai_recommendation?: string;
  ai_rationale?: string;
  created_at: string;
  updated_at: string;
}

export interface LgbItemPhoto {
  photo_id: string;
  item_id: string;
  storage_path: string;
  created_at: string;
}

export interface LgbListing {
  listing_id: string;
  item_id: string;
  lang: Language;
  title: string;
  body: string;
  hashtags: string[];
  channels: string[];
  created_at: string;
}

export interface LgbChallenge {
  challenge_id: string;
  user_id: string;
  days: number;
  start_date: string;
  status: ChallengeStatus;
  current_streak: number;
  max_streak: number;
  created_at: string;
}

export interface LgbChallengeEntry {
  entry_id: string;
  challenge_id: string;
  date: string;
  item_id?: string;
  completed: boolean;
  mission_text?: string;
  tip_text?: string;
  created_at: string;
}

// Expanded types with relations
export interface LgbItemWithPhotosAndListings extends LgbItem {
  photos: string[];
  listings: LgbListing[];
}

export interface LgbSessionFull extends LgbSession {
  items: LgbItemWithPhotosAndListings[];
}

// AI API Request/Response Types
export interface AIAnalyzeItemRequest {
  title: string;
  notes?: string;
  image_urls: string[];
  locale: string;
}

export interface AIAnalyzeItemResponse {
  category: string;
  condition: string;
  usage_score: number; // 0-100
  sentiment: string;
  recommendation: ItemDecision;
  rationale: string;
}

export interface AIPriceSuggestRequest {
  title: string;
  category: string;
  condition: string;
  region: string;
  comps?: any[];
}

export interface AIPriceSuggestResponse {
  price_low: number;
  price_mid: number;
  price_high: number;
  confidence: number; // 0-1
  factors: string[];
}

export interface AIListingGenerateRequest {
  title: string;
  features: string[];
  condition: string;
  locale_from: string;
  locales_to: Language[];
  tone: 'plain' | 'friendly';
}

export interface AIListingGenerateResponse {
  listings: {
    [lang: string]: {
      title: string;
      body: string;
      hashtags: string[];
    };
  };
}

export interface AIPlanScheduleRequest {
  move_date: string;
  region: string;
  trade_method: TradeMethod;
  inventory_summary?: string;
}

export interface AIPlanScheduleResponse {
  weeks: {
    week_index: number;
    goals: string[];
    actions: string[];
  }[];
  highlights: string[];
  risks: string[];
}

export interface AIChallengeePlanRequest {
  days: number;
  start_date: string;
}

export interface AIChallengePlanResponse {
  missions: {
    date: string;
    prompt: string;
    tip: string;
  }[];
  reward_badge: string;
}

export interface AICategoryTipsRequest {
  category: string;
  region: string;
}

export interface AICategoryTipsResponse {
  tips: string[];
  common_flaws: string[];
  bundle_ideas: string[];
}

export interface AITranslateRequest {
  text: string;
  from?: string;
  to: Language;
}

export interface AITranslateResponse {
  text: string;
}

// Standard API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    request_id: string;
    duration_ms: number;
    model?: string;
    version?: string;
  };
}

// Component Props Types
export interface ItemUploaderProps {
  onUpload: (photos: string[]) => void;
  maxPhotos?: number;
  existingPhotos?: string[];
}

export interface ItemCardProps {
  item: LgbItemWithPhotosAndListings;
  onDecisionChange?: (decision: ItemDecision, reason?: string) => void;
  showDecisionControls?: boolean;
  showListings?: boolean;
}

export interface DecisionBarProps {
  decision?: ItemDecision;
  onDecisionChange: (decision: ItemDecision, reason?: string) => void;
  disabled?: boolean;
}

export interface PriceSuggestProps {
  item: LgbItem;
  onPriceAccept: (low: number, mid: number, high: number) => void;
  disabled?: boolean;
}

export interface ListingComposerProps {
  item: LgbItem;
  onListingGenerate: (listings: LgbListing[]) => void;
  languages?: Language[];
  disabled?: boolean;
}