"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildSeed, MAIN_CLIENT_ID, SEED_EPOCH } from "./seed";
import type {
  Activity,
  ActivityKind,
  Client,
  DemoData,
  PlanStep,
  ReferralStatus,
  Resource,
  Sharing,
} from "./types";

// The one shared store behind both demos. It is saved in the browser's local
// storage, so a Diane tab and a Marcus tab read and write the same data.
// Every action that crosses sides also writes to the activity feed.

export const STORAGE_KEY = "entri-demo-v1";

interface DemoActions {
  resetDemo: () => void;
  completeStep: (clientId: string, stepId: string) => void;
  approvePlan: (
    clientId: string,
    draft: {
      plan: Omit<PlanStep, "status" | "completedAt">[];
      profile?: Partial<
        Pick<Client, "summary" | "goal" | "needs" | "skills" | "keepInMind" | "documents">
      >;
    },
  ) => void;
  editStep: (clientId: string, stepId: string, changes: Partial<PlanStep>) => void;
  rewindToIntake: (clientId: string) => void;
  sendMessage: (clientId: string, from: "client" | "caseworker", text: string) => void;
  addCaseNote: (clientId: string, text: string) => void;
  toggleSaved: (resourceId: string) => void;
  tellCaseworker: (clientId: string, resourceId: string) => void;
  addResource: (resource: Omit<Resource, "id">) => void;
  createReferral: (input: {
    clientId: string;
    resourceId: string;
    shared: (keyof Sharing)[];
    note: string;
  }) => void;
  setReferralStatus: (referralId: string, status: ReferralStatus) => void;
  setSharing: (clientId: string, orgId: string, sharing: Sharing) => void;
  markFlagHandled: (flagId: string) => void;
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
          if (i === index) return { ...s, status: "done", completedAt: nowIso() };
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
          activity: [
            entry("step-done", `${client.firstName} completed "${step.title}"`, clientId),
            ...state.activity,
          ],
        }));
      },

      approvePlan: (clientId, draft) => {
        const client = get().clients.find((c) => c.id === clientId);
        if (!client) return;
        const plan = draft.plan.map(
          (s, i): PlanStep => ({ ...s, status: i === 0 ? "current" : "locked" }),
        );
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
              `You approved ${client.firstName}'s plan. ${client.firstName} can now see the first step.`,
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
            plan: c.plan.map((s) => (s.id === stepId ? { ...s, ...changes } : s)),
          })),
          activity: [
            entry("plan-edited", `You updated "${step.title}" in ${client.firstName}'s plan.`, clientId),
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
        if (!client || !trimmed) return;
        set((state) => ({
          messages: [
            ...state.messages,
            { id: uid("msg"), clientId, from, at: nowIso(), text: trimmed },
          ],
          clients:
            from === "client"
              ? mapClient(state, clientId, (c) => ({ ...c, lastCheckIn: nowIso() }))
              : state.clients,
          activity:
            from === "client"
              ? [entry("message", `${client.firstName} sent you a message.`, clientId), ...state.activity]
              : state.activity,
        }));
      },

      addCaseNote: (clientId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((state) => ({
          clients: mapClient(state, clientId, (c) => ({
            ...c,
            caseNotes: [{ id: uid("note"), at: nowIso(), text: trimmed }, ...c.caseNotes],
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
        if (!client || !resource) return;
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

export const selectMainClient = (state: DemoState) =>
  state.clients.find((c) => c.id === MAIN_CLIENT_ID)!;
