import { HOME_ORG_ID, organizations, resources } from "./seed-network";
import type {
  Activity,
  Borough,
  Client,
  ClientStatus,
  DemoData,
  Message,
  Need,
  PlanStep,
  Referral,
  Sharing,
} from "./types";

// The demo world from Entri/context/04-demo-world.md. All people are
// fictional. Dates are built relative to "now" so that "14 days ago" stays
// true whenever the demo is opened.

export const MAIN_CLIENT_ID = "cl-marcus";

// A fixed moment used only for the first server render. The browser replaces
// it with the real time when the demo loads.
export const SEED_EPOCH = "2026-11-13T14:00:00.000Z";

export const MARCUS_INTAKE_NOTES = `Marcus Bell, met today 10am. Released last week after about 6 yrs upstate. Staying w/ cousin in Brooklyn (Bed-Stuy), couch, says it's temporary, cousin's lease doesn't allow long stays.
Has birth cert + release papers. NO state ID. No phone of his own, using cousin's. No bank account.
Worked warehouse before (forklift, not certified now). Cooked in facility kitchen 2 yrs, liked it.
Wants: "steady work and a place of my own." Worried about how to explain the gap to employers.
No benefits yet. Hasn't seen a doctor since release. Seems motivated, a little overwhelmed, asked "where do I even begin?"
Prefers calls over texts. Mornings best.`;

export const ANDRE_INTAKE_NOTES = `Andre K., first meeting today. Released 3 days ago. Staying at a short-stay bed in Jamaica, Queens, has about 3 weeks left there.
Has state ID (still valid) and social security card. Phone works but prepaid minutes almost out.
Before: delivery driver, license expired. Wants to get it back and drive again.
Needs: somewhere to stay after the 3 weeks, income fast, benefits not started.
Has a daughter (9) in Queens, wants to sort out visiting, asked about family court. Told him I'd connect him with legal help.
Quiet, polite, takes notes on paper.`;

const HOME_SHARING: Sharing = { profile: true, plan: true, progress: true };

interface StepTemplate {
  key: string;
  need: Need;
  title: string;
  what: string;
  where: string;
  bring: string[];
  resourceIds: string[];
}

const STEP_TEMPLATES: StepTemplate[] = [
  {
    key: "id",
    need: "id",
    title: "Get a state ID",
    what: "Apply for a New York State non-driver ID card. Most other steps ask for a photo ID, so this one comes first.",
    where:
      "A New York State DMV office. Stop by Brooklyn Bridges first and we will help you fill out the form.",
    bring: ["Your birth certificate", "Your release papers"],
    resourceIds: ["res-bbrc-id", "res-dmv-id"],
  },
  {
    key: "phone",
    need: "phone",
    title: "Get a phone",
    what: "Sign up for a free or low-cost phone, so employers and housing offices can reach you.",
    where: "Connect Line Phone Access in Harlem.",
    bring: ["Your new state ID"],
    resourceIds: ["res-connect-phone"],
  },
  {
    key: "bank",
    need: "banking",
    title: "Open a bank account",
    what: "Open a basic account, so your pay and benefits have a safe place to go.",
    where: "Second Start Credit Union in Bedford-Stuyvesant.",
    bring: ["Your state ID", "$5 to open the account"],
    resourceIds: ["res-secondstart-account"],
  },
  {
    key: "benefits",
    need: "benefits",
    title: "Apply for benefits",
    what: "Apply for food assistance and health coverage. A benefits helper can apply with you.",
    where: "Brooklyn Bridges Reentry Center, on Tuesday or Thursday.",
    bring: ["Your state ID", "Mail that shows where you are staying"],
    resourceIds: ["res-bbrc-benefits", "res-hra-benefits", "res-atlantic-primary"],
  },
  {
    key: "housing",
    need: "housing",
    title: "Apply for housing",
    what: "Apply for a room of your own while you look for a permanent home.",
    where:
      "Your caseworker sends a referral. Then you meet a housing counselor.",
    bring: ["Your state ID", "Proof of income or benefits"],
    resourceIds: ["res-hearth-brooklyn", "res-stoop-shared"],
  },
  {
    key: "work",
    need: "jobs",
    title: "Find work",
    what: "Apply to fair-chance employers. These employers look at your skills before they ask about a record.",
    where: "Start with the job readiness class at Brooklyn Bridges.",
    bring: ["Your state ID", "Your resume from the job readiness class"],
    resourceIds: [
      "res-bbrc-jobready",
      "res-atlas-warehouse",
      "res-commontable-cook",
    ],
  },
];

export function buildSeed(now: Date): DemoData {
  const at = (daysAgo: number, hour = 11, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    // Never produce a time in the future for "today".
    return (d > now ? now : d).toISOString();
  };
  const inDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(17, 0, 0, 0);
    return d.toISOString();
  };

  // Build a plan from the standard steps, with the first `done` complete.
  const buildPlan = (
    clientId: string,
    done: number,
    completedDaysAgo: number[],
    overrides: Partial<Record<string, Partial<PlanStep>>> = {},
  ): PlanStep[] =>
    STEP_TEMPLATES.map((t, i) => {
      const status = i < done ? "done" : i === done ? "current" : "locked";
      return {
        id: `${clientId}-${t.key}`,
        title: t.title,
        what: t.what,
        where: t.where,
        bring: t.bring,
        resourceIds: t.resourceIds,
        status,
        completedAt:
          status === "done" ? at(completedDaysAgo[i] ?? 20, 15) : undefined,
        ...overrides[t.key],
      } satisfies PlanStep;
    });

  const remainingNeeds = (done: number, extra: Need[] = []): Need[] => [
    ...STEP_TEMPLATES.slice(done).map((t) => t.need),
    ...extra,
  ];

  // ---- Anchor clients -------------------------------------------------

  const marcus: Client = {
    id: MAIN_CLIENT_ID,
    firstName: "Marcus",
    lastName: "Bell",
    borough: "Brooklyn",
    createdAt: at(3, 10),
    releasedOn: at(8, 9),
    status: "on-track",
    summary:
      "Released last week after about six years. Staying with a cousin in Brooklyn for now. Has his birth certificate and release papers but no state ID, no phone of his own and no bank account.",
    goal: "Steady work and a place of my own.",
    needs: ["id", "phone", "banking", "benefits", "housing", "jobs"],
    skills: ["Warehouse work", "Forklift (needs new certificate)", "Basic cooking"],
    documents: ["Birth certificate", "Release papers"],
    keepInMind: [
      "Prefers phone calls to texts. Mornings are best.",
      "The stay with his cousin is temporary. Housing matters soon.",
      "Worried about explaining the gap in his work history.",
    ],
    lastCheckIn: at(1, 10, 30),
    planStatus: "approved",
    plan: buildPlan(MAIN_CLIENT_ID, 0, [], { id: { dueAt: inDays(5) } }),
    intakeNotes: MARCUS_INTAKE_NOTES,
    caseNotes: [
      {
        id: "note-marcus-1",
        at: at(3, 11),
        text: "First meeting. Motivated and a little overwhelmed. We agreed to start with his state ID and meet again on Thursday.",
      },
    ],
    sharing: { [HOME_ORG_ID]: HOME_SHARING },
  };

  const tanya: Client = {
    id: "cl-tanya",
    firstName: "Tanya",
    lastName: "M.",
    borough: "Brooklyn",
    createdAt: at(24, 10),
    releasedOn: at(31, 9),
    status: "on-track",
    summary:
      "Home for a month and moving steadily. Finished her ID, phone and bank account this month and is now applying for benefits.",
    goal: "Get certified and work in a warehouse office.",
    needs: remainingNeeds(3, ["training"]),
    skills: ["Inventory and stock counts", "Customer service"],
    documents: ["State ID", "Social Security card"],
    keepInMind: ["Has a forklift course starting soon with Second Shift."],
    lastCheckIn: at(1, 14),
    planStatus: "approved",
    plan: buildPlan("cl-tanya", 3, [16, 9, 3]),
    caseNotes: [],
    sharing: {
      [HOME_ORG_ID]: HOME_SHARING,
      "org-secondshift": { profile: true, plan: false, progress: true },
    },
  };

  const luis: Client = {
    id: "cl-luis",
    firstName: "Luis",
    lastName: "R.",
    borough: "Brooklyn",
    createdAt: at(70, 10),
    releasedOn: at(78, 9),
    status: "on-track",
    summary:
      "Close to finishing his plan. Moved into a shared apartment two weeks ago and has a job interview next week.",
    goal: "A kitchen job and my own lease by spring.",
    needs: ["jobs"],
    skills: ["Line cooking", "Food handler card"],
    documents: ["State ID", "Social Security card", "Food handler card"],
    keepInMind: ["Interview at Common Table Kitchens next week. Offer a practice run."],
    lastCheckIn: at(2, 16),
    planStatus: "approved",
    plan: buildPlan("cl-luis", 5, [62, 55, 48, 36, 14], {
      work: {
        what: "You have an interview for a line cook job at Common Table Kitchens next week.",
        where: "Common Table Kitchens, Brooklyn Navy Yard.",
        dueAt: inDays(6),
        resourceIds: ["res-commontable-cook"],
      },
    }),
    caseNotes: [],
    sharing: {
      [HOME_ORG_ID]: HOME_SHARING,
      "org-stoop": { profile: true, plan: false, progress: false },
    },
  };

  const jamal: Client = {
    id: "cl-jamal",
    firstName: "Jamal",
    lastName: "W.",
    borough: "Brooklyn",
    createdAt: at(52, 10),
    releasedOn: at(60, 9),
    status: "needs-attention",
    summary:
      "Made strong progress for his first month, then went quiet. His housing application has been waiting on him for six days.",
    goal: "Get out of the shelter and near my kids.",
    needs: remainingNeeds(4),
    skills: ["Building maintenance", "Painting"],
    documents: ["State ID", "Social Security card"],
    keepInMind: [
      "Was staying in a shelter in East New York. Phone service may have lapsed.",
    ],
    lastCheckIn: at(14, 13),
    planStatus: "approved",
    plan: buildPlan("cl-jamal", 4, [45, 38, 30, 21], {
      housing: { dueAt: at(6, 17) },
    }),
    caseNotes: [
      {
        id: "note-jamal-1",
        at: at(14, 13, 30),
        text: "Short call. Said the shelter was getting to him. Sent a referral to Hearth House Brooklyn two days later, no reply since.",
      },
    ],
    sharing: {
      [HOME_ORG_ID]: HOME_SHARING,
      "org-openhearth": { profile: true, plan: false, progress: false },
    },
  };

  const andre: Client = {
    id: "cl-andre",
    firstName: "Andre",
    lastName: "K.",
    borough: "Queens",
    createdAt: at(0, 9, 30),
    releasedOn: at(3, 9),
    status: "new",
    summary: "",
    goal: "",
    needs: ["housing", "jobs", "benefits", "legal"],
    skills: [],
    documents: [],
    keepInMind: [],
    lastCheckIn: at(0, 9, 30),
    planStatus: "none",
    plan: [],
    intakeNotes: ANDRE_INTAKE_NOTES,
    caseNotes: [],
    sharing: { [HOME_ORG_ID]: HOME_SHARING },
  };

  const renee: Client = {
    id: "cl-renee",
    firstName: "Renee",
    lastName: "D.",
    borough: "Bronx",
    createdAt: at(33, 10),
    releasedOn: at(40, 9),
    status: "needs-attention",
    summary:
      "Has her ID, phone and bank account. She asked for substance-use support close to home in the Bronx, and no listed resource in the Bronx offers it.",
    goal: "Stay well and get back to home health aide work.",
    needs: remainingNeeds(3, ["substance-use"]),
    skills: ["Home health aide (certificate lapsed)"],
    documents: ["State ID", "Social Security card"],
    keepInMind: [
      "Recovery support is her own top priority. She would rather not travel to Manhattan in the evenings.",
    ],
    lastCheckIn: at(4, 12),
    planStatus: "approved",
    plan: buildPlan("cl-renee", 3, [27, 20, 12]),
    caseNotes: [],
    sharing: { [HOME_ORG_ID]: HOME_SHARING },
  };

  // ---- The rest of Diane's caseload -------------------------------------
  // [first, last, borough, steps done, days since check-in, days since
  //  intake, extra needs]
  const rows: [string, string, Borough, number, number, number, Need[]][] = [
    ["Darnell", "P.", "Bronx", 2, 3, 26, ["substance-use"]],
    ["Keisha", "T.", "Bronx", 4, 5, 47, ["substance-use"]],
    ["Omar", "S.", "Queens", 1, 2, 12, ["legal"]],
    ["Victor", "N.", "Queens", 3, 6, 35, ["legal"]],
    ["Curtis", "B.", "Brooklyn", 2, 10, 30, []],
    ["Sofia", "G.", "Brooklyn", 0, 1, 5, []],
    ["Devon", "A.", "Brooklyn", 1, 2, 6, []],
    ["Miguel", "C.", "Manhattan", 3, 3, 40, []],
    ["Latoya", "H.", "Brooklyn", 5, 4, 80, []],
    ["Reggie", "F.", "Staten Island", 2, 5, 28, ["mental-health"]],
    ["Hassan", "J.", "Brooklyn", 4, 2, 55, []],
    ["Brianna", "L.", "Manhattan", 1, 3, 15, ["primary-care"]],
    ["Terrence", "O.", "Brooklyn", 3, 1, 38, ["training"]],
    ["Elijah", "V.", "Queens", 2, 4, 22, []],
    ["Carmen", "Y.", "Bronx", 5, 6, 90, []],
    ["Isaiah", "E.", "Brooklyn", 2, 2, 19, ["training"]],
    ["Monique", "S.", "Brooklyn", 4, 3, 60, []],
    ["Anthony", "Z.", "Manhattan", 1, 7, 14, []],
    ["Shanice", "U.", "Brooklyn", 3, 1, 44, []],
  ];

  const others: Client[] = rows.map(
    ([firstName, lastName, borough, done, checkIn, intake, extra]) => {
      const id = `cl-${firstName.toLowerCase()}`;
      // Spread completed steps evenly between intake and the last check-in.
      const gap = done > 0 ? (intake - checkIn) / done : 0;
      const completed = Array.from({ length: done }, (_, i) =>
        Math.round(intake - gap * (i + 1)),
      );
      const status: ClientStatus =
        checkIn >= 10 ? "needs-attention" : intake <= 7 ? "new" : "on-track";
      return {
        id,
        firstName,
        lastName,
        borough,
        createdAt: at(intake, 10),
        releasedOn: at(intake + 7, 9),
        status,
        summary: `Working through the plan in ${borough}. ${done} of 6 steps done.`,
        goal: "Steady work and stable housing.",
        needs: remainingNeeds(done, extra),
        skills: [],
        documents: done > 0 ? ["State ID"] : ["Birth certificate"],
        keepInMind: [],
        lastCheckIn: at(checkIn, 12),
        planStatus: "approved",
        plan: buildPlan(id, done, completed),
        caseNotes: [],
        sharing: { [HOME_ORG_ID]: HOME_SHARING },
      } satisfies Client;
    },
  );

  const clients = [marcus, tanya, luis, jamal, andre, renee, ...others];

  // ---- Activity, messages, referrals -----------------------------------

  const stepActivity: Activity[] = clients.flatMap((c) =>
    c.plan
      .filter(
        (s) =>
          s.completedAt &&
          now.getTime() - new Date(s.completedAt).getTime() < 10 * 86400000,
      )
      .map((s) => ({
        id: `act-${s.id}`,
        at: s.completedAt!,
        kind: "step-done" as const,
        clientId: c.id,
        text: `${c.firstName} completed "${s.title}"`,
      })),
  );

  const manualActivity: Activity[] = [
    {
      id: "act-andre-intake",
      at: at(0, 9, 30),
      kind: "intake",
      clientId: "cl-andre",
      text: "Andre joined your caseload. His intake notes are ready for Smart Intake.",
    },
    {
      id: "act-marcus-plan",
      at: at(3, 11, 30),
      kind: "plan-approved",
      clientId: MAIN_CLIENT_ID,
      text: "You approved Marcus's plan. He can now see his first step.",
    },
    {
      id: "act-tanya-referral",
      at: at(5, 15),
      kind: "referral",
      clientId: "cl-tanya",
      text: "Second Shift Workforce Alliance accepted your referral for Tanya.",
    },
  ];
  const activity = [...manualActivity, ...stepActivity].sort((a, b) =>
    b.at.localeCompare(a.at),
  );

  const messages: Message[] = [
    {
      id: "msg-1",
      clientId: MAIN_CLIENT_ID,
      from: "caseworker",
      at: at(3, 12),
      text: "Hi Marcus, it's Diane from Brooklyn Bridges. Your plan is ready in Entri. Your first step is your state ID. Come by on Thursday morning and I will help you with the form.",
    },
    {
      id: "msg-2",
      clientId: MAIN_CLIENT_ID,
      from: "client",
      at: at(3, 18, 20),
      text: "Thank you. I have my birth certificate and my release papers. I will be there Thursday.",
    },
    {
      id: "msg-3",
      clientId: "cl-jamal",
      from: "caseworker",
      at: at(9, 10),
      text: "Hi Jamal, it's Diane. Hearth House has a room open and your application is ready to finish. Call me when you can. No rush on my side, I just don't want you to miss it.",
    },
  ];

  const referrals: Referral[] = [
    {
      id: "ref-jamal-hearth",
      clientId: "cl-jamal",
      resourceId: "res-hearth-brooklyn",
      toOrgId: "org-openhearth",
      shared: ["profile"],
      note: "Jamal is in a shelter and wants a room of his own. He has ID and benefits in place.",
      status: "sent",
      at: at(12, 11),
    },
    {
      id: "ref-tanya-forklift",
      clientId: "cl-tanya",
      resourceId: "res-secondshift-forklift",
      toOrgId: "org-secondshift",
      shared: ["profile", "progress"],
      note: "Tanya has warehouse experience and wants to get certified.",
      status: "accepted",
      at: at(6, 14),
    },
    {
      id: "ref-luis-stoop",
      clientId: "cl-luis",
      resourceId: "res-stoop-shared",
      toOrgId: "org-stoop",
      shared: ["profile"],
      note: "Luis has steady benefits income and is ready for a shared apartment.",
      status: "completed",
      at: at(30, 10),
    },
  ];

  return {
    seededAt: now.toISOString(),
    caseworker: {
      name: "Diane R.",
      firstName: "Diane",
      role: "Reentry Coordinator",
      orgId: HOME_ORG_ID,
    },
    homeOrgId: HOME_ORG_ID,
    mainClientId: MAIN_CLIENT_ID,
    organizations,
    resources,
    clients,
    activity,
    messages,
    referrals,
    savedResourceIds: [],
    handledFlagIds: [],
  };
}
