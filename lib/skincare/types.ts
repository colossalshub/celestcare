export type SkinType = "oily" | "dry" | "combination" | "normal" | "uncertain";

export type SensitivityLevel = "low" | "moderate" | "high" | "unknown";

export type GoalId =
  | "acne-prone"
  | "even-tone"
  | "hyperpigmentation"
  | "hydration"
  | "barrier"
  | "oiliness"
  | "texture"
  | "fine-lines"
  | "sensitive-simplification"
  | "maintenance";

export type ProductCategory =
  | "cleanser"
  | "toner"
  | "serum"
  | "treatment"
  | "exfoliant"
  | "moisturizer"
  | "sunscreen"
  | "oil"
  | "eye"
  | "mask"
  | "other";

export type ProductStatus = "in-use" | "paused" | "finished" | "discarded";

export type IngredientListStatus =
  | "user-confirmed"
  | "manufacturer"
  | "database"
  | "extracted-unconfirmed"
  | "incomplete"
  | "unknown";

export type ProvenanceSource =
  | "user-label"
  | "manufacturer"
  | "database"
  | "extracted"
  | "illustrative-demo"
  | "unknown";

export type SafetyLevel =
  | "BLOCK"
  | "HIGH_CAUTION"
  | "CAUTION"
  | "INFORMATION"
  | "COMPATIBLE"
  | "UNKNOWN";

export type EvidenceGrade = "STRONG" | "MODERATE" | "LIMITED" | "UNCERTAIN";

export type RoutineProfile = "minimal" | "balanced" | "goal-focused" | "sensitive" | "recovery";

export type ApplicationPeriod = "am" | "pm" | "both" | "as-needed";

export type RemainingAmount = "full" | "plenty" | "half" | "low" | "empty" | "unknown";

export type MoisturizerWeight = "light" | "medium" | "rich";

export type PregnancyStatus =
  | "not-applicable"
  | "pregnant"
  | "trying"
  | "breastfeeding"
  | "prefer-not";

export type OutdoorExposure = "minimal" | "commute" | "extended" | "variable";

export type IngredientClass =
  | "retinoid"
  | "exfoliant-acid"
  | "benzoyl-peroxide"
  | "vitamin-c"
  | "humectant"
  | "barrier-lipid"
  | "niacinamide"
  | "sunscreen-filter"
  | "fragrance"
  | "preservative";

export interface AllergyEntry {
  id: string;
  kind: "confirmed" | "suspected" | "prior-reaction";
  label: string;
  ingredientIds: string[];
  customTerms: string[];
  severity: "mild" | "moderate" | "severe" | "unknown";
  notes?: string;
}

export interface UserProfile {
  id: string;
  displayName?: string;
  skinType: SkinType;
  sensitivity: SensitivityLevel;
  concerns: string[];
  goals: { id: GoalId; priority: number }[];
  allergies: AllergyEntry[];
  fragranceSensitive: boolean;
  dermatologistGuidance?: string;
  routineLength: "short" | "standard" | "extended";
  morningTime?: string;
  eveningTime?: string;
  outdoorExposure: OutdoorExposure;
  climateNote?: string;
  pregnancyStatus: PregnancyStatus;
  medicationNotes?: string;
  needsProfessionalCare: boolean;
  professionalCareNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductIngredient {
  name: string;
  canonicalId?: string;
  unmatched?: boolean;
  concentration?: string;
  isActive?: boolean;
}

export interface ProductReaction {
  id: string;
  date: string;
  severity: "mild" | "moderate" | "severe";
  emergency: boolean;
  description: string;
  ongoing: boolean;
}

export interface ProductSchedule {
  period: "am" | "pm" | "both";
  /** Maximum days per week. 7 means daily. Omitted means follow period without a weekly cap. */
  timesPerWeek?: number;
  /** When true, the optimizer must not increase frequency above the recorded schedule. */
  exact: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  status: ProductStatus;
  ingredients: ProductIngredient[];
  ingredientListStatus: IngredientListStatus;
  provenance: {
    source: ProvenanceSource;
    detail: string;
    retrievedAt?: string;
    url?: string;
  };
  benefits: string[];
  texture?: string;
  instructions?: string;
  frequency?: string;
  amountGuidance?: string;
  /** Only when the label or a reviewed source supports a wait. */
  waitTime?: string;
  applicationPeriod: ApplicationPeriod;
  prescription: boolean;
  prescriberInstructions?: string;
  /** Classes this label says not to combine with. */
  doNotCombineWith?: IngredientClass[];
  schedule?: ProductSchedule;
  spf?: number | null;
  broadSpectrum?: boolean | null;
  waterResistant?: boolean | null;
  waterResistantMinutes?: 40 | 80 | null;
  purchaseDate?: string;
  openedDate?: string;
  expiryDate?: string;
  paoMonths?: number | null;
  remaining: RemainingAmount;
  reactions: ProductReaction[];
  introducedAt?: string;
  newProduct: boolean;
  moisturizerWeight?: MoisturizerWeight | null;
  barcode?: string;
  labelImageDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  comfort: "comfortable" | "tight" | "uncomfortable" | "not-logged";
  drynessOiliness: "dry" | "balanced" | "oily" | "not-logged";
  irritation: "none" | "mild" | "moderate" | "severe";
  breakouts: "none" | "some" | "many" | "not-logged";
  notes: string;
  photoDataUrl?: string;
  emergencySymptoms: boolean;
  createdAt: string;
}

export interface AdherenceEvent {
  id: string;
  date: string;
  period: "am" | "pm";
  productId: string;
  action: "completed" | "skipped";
  at: string;
}

export interface PlannedStep {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  period: "am" | "pm";
  order: number;
  sortKey: number;
  purpose: string;
  why: string;
  benefits: string[];
  limitations: string[];
  compatibilityNotes: string[];
  frequency: string;
  amount?: string;
  waitTime?: string;
  evidenceClaimIds: string[];
  safetyNote?: string;
}

export type ExclusionCode =
  | "confirmed-allergy"
  | "suspected-sensitivity"
  | "severe-reaction"
  | "incomplete-ingredients"
  | "unconfirmed-extraction"
  | "pregnancy-retinoid"
  | "pregnancy-salicylic"
  | "irritation-hold"
  | "label-conflict"
  | "duplicate-active"
  | "alternated"
  | "not-scheduled-today"
  | "new-irritant-limit"
  | "mode-simplified"
  | "insufficient-evidence"
  | "not-in-use"
  | "paused-or-finished";

export interface Exclusion {
  productId: string;
  productName: string;
  level: SafetyLevel;
  code: ExclusionCode;
  explanation: string;
  sourceIds: string[];
}

export interface PlanAlert {
  id: string;
  tone: "emergency" | "block" | "caution" | "info";
  title: string;
  body: string;
}

export interface RoutinePlan {
  generatedAt: string;
  modeRequested: RoutineProfile;
  modeUsed: RoutineProfile;
  morning: PlannedStep[];
  evening: PlannedStep[];
  excluded: Exclusion[];
  uncertainties: string[];
  alerts: PlanAlert[];
  weatherApplied: boolean;
  weatherStale: boolean;
  weatherMissing: boolean;
  weatherNotes: string[];
  differsFromBaseline: boolean;
  differenceReasons: string[];
  goalsUnsupported: { goalId: GoalId; message: string }[];
  fingerprint: string;
  rejectedExternalProductIds: string[];
}
