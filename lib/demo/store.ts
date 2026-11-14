"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildSeed,
  buildStarterPlan,
  MAIN_CLIENT_ID,
  SEED_EPOCH,
  STARTER_NEEDS,
} from "./seed";
import { NEED_LABELS, onCaseload } from "./types";
import type {
  Activity,
  ActivityKind,
  Borough,
  Client,
  Need,
  DemoData,
  PlanStep,
  ReferralStatus,
  Resource,
  Sharing,
} from "./types";

// The one shared store behind both demos. It is saved in the browser's local
// storage, so a Diane tab and a Marcus tab read and write the same data.
// Every action that crosses sides also writes to the activity feed.

export const STORAGE_KEY = "entri-demo-v4";

interface DemoActions {
  resetDemo: () => void;
  completeStep: (clientId: string, stepId: string) => void;
  approvePlan: (
    clientId: string,
    draft: {
      plan: Omit<PlanStep, "status" | "completedAt">[];
      profile?: Partial<
        Pick<
          Client,
          | "summary"
          | "goal"
          | "needs"
          | "skills"
          | "keepInMind"
          | "documents"
          | "borough"
        >
      >;
    },
  ) => void;
  editStep: (
    clientId: string,
    stepId: string,
    changes: Partial<PlanStep>,
  ) => void;
  rewindToIntake: (clientId: string) => void;
  sendMessage: (
    clientId: string,
    from: "client" | "caseworker",
    text: string,
  ) => void;
  addCaseNote: (clientId: string, text: string) => void;
  toggleSaved: (resourceId: string) => void;
  tellCaseworker: (clientId: string, resourceId: string) => void;
  addResource: (resource: Omit<Resource, "id">) => void;
  updateResource: (
    resourceId: string,
    changes: Partial<Omit<Resource, "id">>,
  ) => void;
  createClient: (input: {
    firstName: string;
    lastName: string;
    borough: Borough;
    intakeNotes: string;
  }) => string;
  removeStep: (clientId: string, stepId: string) => void;
  createReferral: (input: {
    clientId: string;
    resourceId: string;
    shared: (keyof Sharing)[];
    note: string;
  }) => void;
  setReferralStatus: (referralId: string, status: ReferralStatus) => void;
  setSharing: (clientId: string, orgId: string, sharing: Sharing) => void;
  markFlagHandled: (flagId: string) => void;
  signIn: () => void;
  signOut: () => void;
  markGuideSeen: () => void;
  startOwnPlan: (input: {
    firstName: string;
    borough: Borough;
    have: Need[];
  }) => void;
  connectCaseworker: (input: { sharing: Sharing; note: string }) => void;
}

export type DemoState = DemoData & DemoActions;

// Local storage can be missing or blocked (for example in some private
// windows). In that case the demo keeps its data in memory for the page.
const memory = new Map<string, string>();
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const nowIso = () => new Date().toISOString();

const entry = (
  kind: ActivityKind,
  text: string,
  clientId?: string,
): Activity => ({ id: uid("act"), at: nowIso(), kind, text, clientId });

const mapClient = (
  state: DemoData,
  clientId: string,
  fn: (c: Client) => Client,
): Client[] => state.clients.map((c) => (c.id === clientId ? fn(c) : c));

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...buildSeed(new Date(SEED_EPOCH)),

      resetDemo: () => set(buildSeed(new Date())),

      completeStep: (clientId, stepId) => {
        const client = get().clients.find((c) => c.id === clientId);
        const step = client?.plan.find((s) => s.id === stepId);
        if (!client || !step || step.status !== "current") return;
        const index = client.plan.indexOf(step);
        const plan = client.plan.map((s, i): PlanStep => {
          if (i === index)
            return { ...s, status: "done", completedAt: nowIso() };
          if (i === index + 1) return { ...s, status: "current" };
          return s;
        });
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            plan,
            lastCheckIn: nowIso(),
            status: c.status === "new" ? "on-track" : c.status,
          })),
          // The caseworker hears about it only if the person has one and
          // has agreed to share progress.
          activity:
            onCaseload(client) &&
            (client.sharing[state.homeOrgId]?.progress ?? false)
              ? [
                  entry(
                    "step-done",
                    `${client.firstName} completed "${step.title}"`,
                    clientId,
                  ),
                  ...state.activity,
                ]
              : state.activity,
        }));
      },

      approvePlan: (clientId, draft) => {
        const client = get().clients.find((c) => c.id === clientId);
        if (!client) return;
        // Steps the client already finished stay finished when the plan is
        // replaced. The first step that is not done becomes the current one.
        const finished = new Map(
          client.plan
            .filter((s) => s.status === "done")
            .map((s) => [s.title.trim().toLowerCase(), s.completedAt]),
        );
        let currentSet = false;
        const plan = draft.plan.map((s): PlanStep => {
          const key = s.title.trim().toLowerCase();
          if (finished.has(key)) {
            return { ...s, status: "done", completedAt: finished.get(key) };
          }
          if (!currentSet) {
            currentSet = true;
            return { ...s, status: "current" };
          }
          return { ...s, status: "locked" };
        });
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            ...draft.profile,
            plan,
            planStatus: "approved",
            status: "on-track",
          })),
          activity: [
            entry(
              "plan-approved",
              `You approved ${client.firstName}'s personal plan. ${client.firstName} can see it now.`,
              clientId,
            ),
            ...state.activity,
          ],
        }));
      },

      editStep: (clientId, stepId, changes) => {
        const client = get().clients.find((c) => c.id === clientId);
        const step = client?.plan.find((s) => s.id === stepId);
        if (!client || !step) return;
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            plan: c.plan.map((s) =>
              s.id === stepId ? { ...s, ...changes } : s,
            ),
          })),
          activity: [
            entry(
              "plan-edited",
              `You updated "${step.title}" in ${client.firstName}'s plan.`,
              clientId,
            ),
            ...state.activity,
          ],
        }));
      },

      // Puts a client back to the moment before Smart Intake. The guided tour
      // uses this for Marcus so the visitor can draft and approve his plan.
      rewindToIntake: (clientId) =>
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            planStatus: "none",
            plan: [],
            status: "new",
          })),
          activity: state.activity.filter(
            (a) => !(a.clientId === clientId && a.kind !== "intake"),
          ),
          messages: state.messages.filter((m) => m.clientId !== clientId),
        })),

      sendMessage: (clientId, from, text) => {
        const client = get().clients.find((c) => c.id === clientId);
        const trimmed = text.trim();
        if (!client || !trimmed || !onCaseload(client)) return;
        set((state) => ({
          messages: [
            ...state.messages,
            { id: uid("msg"), clientId, from, at: nowIso(), text: trimmed },
          ],
          clients:
            from === "client"
              ? mapClient(state, clientId, (c) => ({
                  ...c,
                  lastCheckIn: nowIso(),
                }))
              : state.clients,
          activity:
            from === "client"
              ? [
                  entry(
                    "message",
                    `${client.firstName} sent you a message.`,
                    clientId,
                  ),
                  ...state.activity,
                ]
              : state.activity,
        }));
      },

      addCaseNote: (clientId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            caseNotes: [
              { id: uid("note"), at: nowIso(), text: trimmed },
              ...c.caseNotes,
            ],
          })),
        }));
      },

      toggleSaved: (resourceId) =>
        set((state) => ({
          savedResourceIds: state.savedResourceIds.includes(resourceId)
            ? state.savedResourceIds.filter((id) => id !== resourceId)
            : [...state.savedResourceIds, resourceId],
        })),

      tellCaseworker: (clientId, resourceId) => {
        const client = get().clients.find((c) => c.id === clientId);
        const resource = get().resources.find((r) => r.id === resourceId);
        if (!client || !resource || !onCaseload(client)) return;
        const org = get().organizations.find((o) => o.id === resource.orgId);
        set((state) => ({
          activity: [
            entry(
              "interest",
              `${client.firstName} is interested in "${resource.name}"${org ? ` at ${org.name}` : ""}.`,
              clientId,
            ),
            ...state.activity,
          ],
        }));
      },

      addResource: (resource) =>
        set((state) => ({
          resources: [{ ...resource, id: uid("res") }, ...state.resources],
          activity: [
            entry("resource", `You added "${resource.name}" to the network.`),
            ...state.activity,
          ],
        })),

      updateResource: (resourceId, changes) =>
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === resourceId ? { ...r, ...changes } : r,
          ),
        })),

      createClient: ({ firstName, lastName, borough, intakeNotes }) => {
        const id = uid("cl");
        const now = nowIso();
        const client: Client = {
          id,
          firstName,
          lastName,
          borough,
          createdAt: now,
          releasedOn: now,
          status: "new",
          summary: "",
          goal: "",
          needs: [],
          skills: [],
          documents: [],
          keepInMind: [],
          lastCheckIn: now,
          planStatus: "none",
          plan: [],
          intakeNotes,
          caseNotes: [],
          sharing: {
            [get().homeOrgId]: { profile: true, plan: true, progress: true },
          },
        };
        set((state) => ({
          clients: [client, ...state.clients],
          activity: [
            entry("intake", `${firstName} joined your caseload.`, id),
            ...state.activity,
          ],
        }));
        return id;
      },

      // Removes a step that is not done yet. If it was the current step,
      // the next one becomes current.
      removeStep: (clientId, stepId) => {
        const client = get().clients.find((c) => c.id === clientId);
        const step = client?.plan.find((s) => s.id === stepId);
        if (!client || !step || step.status === "done") return;
        const rest = client.plan.filter((s) => s.id !== stepId);
        const hasCurrent = rest.some((s) => s.status === "current");
        let promoted = false;
        const plan = rest.map((s): PlanStep => {
          if (!hasCurrent && !promoted && s.status === "locked") {
            promoted = true;
            return { ...s, status: "current" };
          }
          return s;
        });
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({ ...c, plan })),
          activity: [
            entry(
              "plan-edited",
              `You removed "${step.title}" from ${client.firstName}'s plan.`,
              clientId,
            ),
            ...state.activity,
          ],
        }));
      },

      createReferral: ({ clientId, resourceId, shared, note }) => {
        const client = get().clients.find((c) => c.id === clientId);
        const resource = get().resources.find((r) => r.id === resourceId);
        if (!client || !resource) return;
        const org = get().organizations.find((o) => o.id === resource.orgId);
        set((state) => ({
          referrals: [
            {
              id: uid("ref"),
              clientId,
              resourceId,
              toOrgId: resource.orgId,
              shared,
              note,
              status: "sent",
              at: nowIso(),
            },
            ...state.referrals,
          ],
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            sharing: {
              ...c.sharing,
              [resource.orgId]: {
                profile: shared.includes("profile"),
                plan: shared.includes("plan"),
                progress: shared.includes("progress"),
              },
            },
          })),
          activity: [
            entry(
              "referral",
              `You referred ${client.firstName} to ${org?.name ?? resource.name}.`,
              clientId,
            ),
            ...state.activity,
          ],
        }));
      },

      setReferralStatus: (referralId, status) =>
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === referralId ? { ...r, status } : r,
          ),
        })),

      setSharing: (clientId, orgId, sharing) =>
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            sharing: { ...c.sharing, [orgId]: sharing },
          })),
        })),

      signIn: () => set({ signedIn: true }),
      signOut: () => set({ signedIn: false }),
      markGuideSeen: () => set({ seenGuide: true }),

      // A person who creates their own account gets the standard steps,
      // minus what they already have. No caseworker is needed for this.
      startOwnPlan: ({ firstName, borough, have }) => {
        const id = get().mainClientId;
        const name = firstName.trim() || "Friend";
        const now = nowIso();
        const has = have.length
          ? `Says they already have: ${have.map((n) => NEED_LABELS[n]).join(", ")}.`
          : "Says they are starting without ID, phone, bank account, benefits, housing or work.";
        set((state) => ({
          signedIn: true,
          seenGuide: false,
          // A new account is a new person: no caseworker, nothing shared.
          clients: mapClient(state, id, (c) => ({
            ...c,
            firstName: name,
            lastName: "",
            borough,
            createdAt: now,
            status: "new",
            summary: "",
            goal: "",
            skills: [],
            documents: [],
            keepInMind: [],
            caseNotes: [],
            planStatus: "starter",
            plan: buildStarterPlan(id, have),
            needs: STARTER_NEEDS.filter((n) => !have.includes(n)),
            intakeNotes: `${name} created an Entri account online. Staying in ${borough}. ${has}`,
            lastCheckIn: now,
            sharing: {},
            connected: false,
          })),
          messages: state.messages.filter((m) => m.clientId !== id),
          referrals: state.referrals.filter((r) => r.clientId !== id),
          activity: state.activity.filter((a) => a.clientId !== id),
          savedResourceIds: [],
        }));
      },

      // The person asks for a caseworker and chooses what to share. Only
      // now do they appear on the organization's caseload.
      connectCaseworker: ({ sharing, note }) => {
        const id = get().mainClientId;
        const client = get().clients.find((c) => c.id === id);
        if (!client || onCaseload(client)) return;
        const now = nowIso();
        const chosen = (["profile", "plan", "progress"] as const).filter(
          (k) => sharing[k],
        );
        const trimmed = note.trim();
        set((state) => ({
          clients: mapClient(state, id, (c) => ({
            ...c,
            connected: true,
            createdAt: now,
            lastCheckIn: now,
            status: "new",
            sharing: { ...c.sharing, [state.homeOrgId]: sharing },
          })),
          messages: trimmed
            ? [
                ...state.messages,
                {
                  id: uid("msg"),
                  clientId: id,
                  from: "client",
                  at: now,
                  text: trimmed,
                },
              ]
            : state.messages,
          activity: [
            entry(
              "connect",
              `${client.firstName} asked for a caseworker through Entri. Shared with you: ${chosen.length ? chosen.join(", ") : "name only"}.`,
              id,
            ),
            ...state.activity,
          ],
        }));
      },

      markFlagHandled: (flagId) =>
        set((state) => ({
          handledFlagIds: state.handledFlagIds.includes(flagId)
            ? state.handledFlagIds
            : [...state.handledFlagIds, flagId],
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      // The provider loads saved data after the page mounts, so the server
      // and the browser render the same first frame.
      skipHydration: true,
    },
  ),
);

// The people the caseworker works with. Someone using Entri on their own
// is left out until they ask for a caseworker.
export function useCaseload(): Client[] {
  const clients = useDemo((s) => s.clients);
  return useMemo(() => clients.filter(onCaseload), [clients]);
}

export const selectMainClient = (state: DemoState) =>
  state.clients.find((c) => c.id === MAIN_CLIENT_ID)!;
