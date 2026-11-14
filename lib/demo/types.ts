// Shapes for the shared demo data. Everything here is fictional.

export type Borough =
  | "Brooklyn"
  | "Manhattan"
  | "Queens"
  | "Bronx"
  | "Staten Island";

export type Category =
  | "jobs"
  | "housing"
  | "health"
  | "legal"
  | "id-benefits"
  | "training";

// What a person may need, and what a resource may offer. Gap Analysis
// compares the two.
export type Need =
  | "id"
  | "phone"
  | "banking"
  | "benefits"
  | "housing"
  | "jobs"
  | "training"
  | "primary-care"
  | "mental-health"
  | "substance-use"
  | "legal";

export type OrgTier = "partner" | "listed";

export interface Organization {
  id: string;
  name: string;
  tier: OrgTier;
  borough: Borough;
  about: string;
  // True for real public offices shown with publicly available information.
  publicInfo?: boolean;
}

export interface Resource {
  id: string;
  orgId: string;
  name: string;
  category: Category;
  services: Need[];
  borough: Borough;
  address: string;
  offers: string;
  eligibility: string;
  howToApply: string;
  contact: string;
  hours?: string;
  // Jobs only
  fairChance?: boolean;
  payRange?: string;
  // Housing only
  housingType?: string;
  capacity?: string;
}

export type StepStatus = "done" | "current" | "locked";

export interface PlanStep {
  id: string;
  title: string;
  what: string;
  where: string;
  bring: string[];
  resourceIds: string[];
  status: StepStatus;
  completedAt?: string;
  dueAt?: string;
}

export type ClientStatus = "on-track" | "needs-attention" | "new";
// "starter" is the standard plan a person gets when they join on their own.
// "approved" is a personal plan a caseworker has reviewed.
export type PlanStatus = "none" | "starter" | "approved";

export interface CaseNote {
  id: string;
  at: string;
  text: string;
}

export interface Sharing {
  profile: boolean;
  plan: boolean;
  progress: boolean;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  borough: Borough;
  createdAt: string;
  releasedOn: string;
  status: ClientStatus;
  summary: string;
  goal: string;
  needs: Need[];
  skills: string[];
  documents: string[];
  keepInMind: string[];
  lastCheckIn: string;
  planStatus: PlanStatus;
  plan: PlanStep[];
  intakeNotes?: string;
  caseNotes: CaseNote[];
  // Keyed by organization id. The client chooses what each one can see.
  sharing: Record<string, Sharing>;
}

export type ActivityKind =
  | "step-done"
  | "plan-approved"
  | "plan-edited"
  | "message"
  | "referral"
  | "resource"
  | "intake"
  | "check-in"
  | "interest";

export interface Activity {
  id: string;
  at: string;
  kind: ActivityKind;
  clientId?: string;
  text: string;
}

export interface Message {
  id: string;
  clientId: string;
  from: "client" | "caseworker";
  at: string;
  text: string;
}

export type ReferralStatus = "sent" | "accepted" | "completed";

export interface Referral {
  id: string;
  clientId: string;
  resourceId: string;
  toOrgId: string;
  shared: (keyof Sharing)[];
  note: string;
  status: ReferralStatus;
  at: string;
}

export interface Caseworker {
  name: string;
  firstName: string;
  role: string;
  orgId: string;
}

export interface DemoData {
  seededAt: string;
  caseworker: Caseworker;
  homeOrgId: string;
  mainClientId: string;
  organizations: Organization[];
  resources: Resource[];
  clients: Client[];
  activity: Activity[];
  messages: Message[];
  referrals: Referral[];
  savedResourceIds: string[];
  handledFlagIds: string[];
  // The returning citizen demo starts at a sign-in page.
  signedIn: boolean;
  seenGuide: boolean;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  jobs: "Jobs",
  housing: "Housing",
  health: "Health",
  legal: "Legal help",
  "id-benefits": "ID and benefits",
  training: "Training",
};

export const NEED_LABELS: Record<Need, string> = {
  id: "ID documents",
  phone: "a phone",
  banking: "a bank account",
  benefits: "benefits",
  housing: "housing",
  jobs: "work",
  training: "job training",
  "primary-care": "primary care",
  "mental-health": "counseling",
  "substance-use": "substance-use support",
  legal: "legal help",
};

export const BOROUGHS: Borough[] = [
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Bronx",
  "Staten Island",
];

// Short labels for chips and filters.
export const NEED_CHIPS: Record<Need, string> = {
  id: "ID",
  phone: "Phone",
  banking: "Bank account",
  benefits: "Benefits",
  housing: "Housing",
  jobs: "Work",
  training: "Job training",
  "primary-care": "Primary care",
  "mental-health": "Counseling",
  "substance-use": "Substance-use support",
  legal: "Legal help",
};

// The kinds of help each resource type can offer.
export const CATEGORY_NEEDS: Record<Category, Need[]> = {
  jobs: ["jobs"],
  housing: ["housing"],
  health: ["primary-care", "mental-health", "substance-use"],
  legal: ["legal"],
  "id-benefits": ["id", "phone", "banking", "benefits"],
  training: ["training"],
};
