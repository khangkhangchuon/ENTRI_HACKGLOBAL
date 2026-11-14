import * as z from "zod";

// The shapes that travel between the browser, the server and the AI.
// Both sides import this file, so it holds no secrets and no server code.

export const BOROUGH_VALUES = [
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Bronx",
  "Staten Island",
] as const;

export const NEED_VALUES = [
  "id",
  "phone",
  "banking",
  "benefits",
  "housing",
  "jobs",
  "training",
  "primary-care",
  "mental-health",
  "substance-use",
  "legal",
] as const;

const CATEGORY_VALUES = [
  "jobs",
  "housing",
  "health",
  "legal",
  "id-benefits",
  "training",
] as const;

const id = z.string().min(1).max(80);
const short = z.string().max(160);

// ---- Smart Intake ------------------------------------------------------

export const ResourceBrief = z.object({
  id,
  name: short,
  org: short,
  category: z.enum(CATEGORY_VALUES),
  services: z.array(z.enum(NEED_VALUES)).max(8),
  borough: z.enum(BOROUGH_VALUES),
  fairChance: z.boolean().optional(),
  offers: z.string().max(400),
});
export type ResourceBrief = z.infer<typeof ResourceBrief>;

export const NOTES_MAX = 4000;

export const IntakeRequest = z.object({
  notes: z.string().trim().min(20).max(NOTES_MAX),
  releaseDate: z.string().max(40).optional(),
  borough: z.enum(BOROUGH_VALUES).optional(),
  documents: z.string().max(300).optional(),
  resources: z.array(ResourceBrief).max(80),
});
export type IntakeRequest = z.infer<typeof IntakeRequest>;

export const IntakeDraft = z.object({
  firstName: z.string(),
  lastName: z.string(),
  borough: z.enum(BOROUGH_VALUES),
  summary: z.string(),
  goal: z.string(),
  needs: z.array(z.enum(NEED_VALUES)),
  skills: z.array(z.string()),
  documents: z.array(z.string()),
  keepInMind: z.array(z.string()),
  matches: z.array(z.object({ resourceId: z.string(), reason: z.string() })),
  steps: z.array(
    z.object({
      title: z.string(),
      what: z.string(),
      where: z.string(),
      bring: z.array(z.string()),
      resourceIds: z.array(z.string()),
    }),
  ),
});
export type IntakeDraft = z.infer<typeof IntakeDraft>;

// ---- Caseload Intelligence ---------------------------------------------

export const ClientFacts = z.object({
  id,
  name: short,
  borough: z.enum(BOROUGH_VALUES),
  hasPlan: z.boolean(),
  // True when the client is on the standard plan they began on their own.
  starterPlanOnly: z.boolean(),
  daysSinceIntake: z.number().int().min(0).max(5000),
  daysSinceCheckIn: z.number().int().min(0).max(5000),
  stepsDone: z.number().int().min(0).max(50),
  stepsTotal: z.number().int().min(0).max(50),
  stepsDoneLast7Days: z.number().int().min(0).max(50),
  currentStep: short.nullable(),
  // Positive when the current step is past its due date.
  currentStepOverdueDays: z.number().int().min(0).max(5000).nullable(),
  currentStepDueInDays: z.number().int().min(0).max(5000).nullable(),
  // Days since the caseworker sent a message that got no reply.
  unansweredMessageDays: z.number().int().min(0).max(5000).nullable(),
  waitingReferrals: z
    .array(z.object({ to: short, daysWaiting: z.number().int().min(0).max(5000) }))
    .max(10),
});
export type ClientFacts = z.infer<typeof ClientFacts>;

export const CaseloadRequest = z.object({
  clients: z.array(ClientFacts).min(1).max(80),
});
export type CaseloadRequest = z.infer<typeof CaseloadRequest>;

export const FLAG_KINDS = [
  "quiet",
  "overdue",
  "new-intake",
  "referral-waiting",
  "milestone",
] as const;

export const CaseloadDigest = z.object({
  flags: z.array(
    z.object({
      clientId: z.string(),
      kind: z.enum(FLAG_KINDS),
      headline: z.string(),
      detail: z.string(),
      suggestedAction: z.string(),
    }),
  ),
});
export type CaseloadDigest = z.infer<typeof CaseloadDigest>;
export type CaseloadFlag = CaseloadDigest["flags"][number];

// ---- Gap Analysis ------------------------------------------------------

export const GapFact = z.object({
  need: z.enum(NEED_VALUES),
  borough: z.enum(BOROUGH_VALUES),
  clientCount: z.number().int().min(1).max(500),
  clientNames: z.array(short).max(40),
  // Resources in other boroughs that offer this kind of help.
  candidates: z
    .array(
      z.object({
        resourceId: id,
        name: short,
        org: short,
        tier: z.enum(["partner", "listed"]),
        borough: z.enum(BOROUGH_VALUES),
        offers: z.string().max(400),
      }),
    )
    .max(12),
});
export type GapFact = z.infer<typeof GapFact>;

export const GapsRequest = z.object({
  caseloadSize: z.number().int().min(1).max(5000),
  gaps: z.array(GapFact).max(30),
});
export type GapsRequest = z.infer<typeof GapsRequest>;

export const GapFindings = z.object({
  findings: z.array(
    z.object({
      need: z.enum(NEED_VALUES),
      borough: z.enum(BOROUGH_VALUES),
      headline: z.string(),
      detail: z.string(),
      suggestedResourceId: z.string(),
      reason: z.string(),
    }),
  ),
});
export type GapFindings = z.infer<typeof GapFindings>;
export type GapFinding = GapFindings["findings"][number];

// ---- Ask Entri -----------------------------------------------------------

export const QUESTION_MAX = 500;

export const AskListing = z.object({
  id,
  name: short,
  org: short,
  category: z.enum(CATEGORY_VALUES),
  borough: z.enum(BOROUGH_VALUES),
  offers: z.string().max(400),
  address: z.string().max(200),
  contact: z.string().max(200),
  howToApply: z.string().max(400),
  fairChance: z.boolean().optional(),
});
export type AskListing = z.infer<typeof AskListing>;

export const AskRequest = z.object({
  question: z.string().trim().min(2).max(QUESTION_MAX),
  // The last few turns, so a follow-up question makes sense.
  history: z
    .array(z.object({ role: z.enum(["user", "entri"]), text: z.string().max(1200) }))
    .max(6),
  context: z.object({
    firstName: z.string().max(40),
    borough: z.enum(BOROUGH_VALUES),
    currentStep: short.nullable(),
    hasCaseworker: z.boolean(),
  }),
  listings: z.array(AskListing).max(80),
});
export type AskRequest = z.infer<typeof AskRequest>;

export const ASK_KINDS = ["answer", "legal", "unknown", "off-topic", "crisis"] as const;
export type AskKind = (typeof ASK_KINDS)[number];

// What the model writes.
export const AskDraft = z.object({
  kind: z.enum(ASK_KINDS),
  text: z.string(),
  sourceIds: z.array(z.string()),
  offerAdvocate: z.boolean(),
});

// What the browser receives.
export interface AskSource {
  id: string;
  title: string;
  source: string;
  url: string;
  checked: string;
  passage: string;
}

export interface AskAnswer {
  kind: AskKind;
  text: string;
  sources: AskSource[];
  offerAdvocate: boolean;
}

// ---- Shared reply shape --------------------------------------------------

export type AiErrorCode = "unavailable" | "busy" | "invalid" | "declined";

export type AiReply<T> =
  | { ok: true; data: T; generatedAt: string }
  | { ok: false; code: AiErrorCode; message: string };
