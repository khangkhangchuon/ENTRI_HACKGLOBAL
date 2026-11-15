import type { AskAnswer, AskRequest, AskSource } from "@/lib/ai/schemas";
import { LIBRARY } from "./library";
import { UNKNOWN_TEXT } from "./safety";

// Turns a library entry or a network listing into a source the chat can show.
export const asSource = (
  id: string,
  listings: AskRequest["listings"],
): AskSource | null => {
  const doc = LIBRARY.find((d) => d.id === id);
  if (doc) {
    return {
      id: doc.id,
      title: doc.title,
      source: doc.source,
      url: doc.url,
      checked: doc.checked,
      passage: doc.text,
    };
  }
  const l = listings.find((x) => x.id === id);
  if (!l) return null;
  return {
    id: l.id,
    title: `${l.name}, ${l.org}`,
    source: "Entri network listing",
    url: "/app/find",
    checked: "demo data",
    passage: `${l.offers} Where: ${l.address}, ${l.borough}. Contact: ${l.contact}. How to start: ${l.howToApply}`,
  };
};

// Plan B for Ask Entri. When the AI cannot be reached, the person gets the
// verified passage for the topic of the question, word for word, with its
// source. Nothing is written fresh, so nothing can be made up.

// Topics are matched by plain words, first match wins. A question that fits
// no topic gets "I don't have verified information about that."
const TOPICS: [RegExp, string][] = [
  [
    /where do i (start|begin)|first step|just got out|do first|overwhelmed|came home|got home/,
    "entri-order",
  ],
  [
    /shelter|homeless|nowhere to (stay|sleep|go)|(stay|sleep) tonight/,
    "shelter-intake",
  ],
  [/snap\b|food stamp|food assistance|ebt\b|groceries/, "snap"],
  [/cash assistance|public assistance|welfare/, "cash-assistance"],
  [/medicaid|health (coverage|insurance)/, "medicaid"],
  [/idnyc|city id|municipal id/, "idnyc-apply"],
  [
    /(state |photo |an |my |get )id\b|identification|dmv|non-driver/,
    "nys-id-apply",
  ],
  [
    /employer|background check|my record|a record|fair chance|conviction|job application/,
    "fair-chance-act",
  ],
  [/bank|checking|credit union/, "safestart-account"],
  [/phone|lifeline|cell/, "lifeline"],
];
const ABOUT_COST = /fee|cost|how much|price|free|pay/;
const COST_DOCS: Record<string, string> = {
  "nys-id-apply": "nys-id-fees",
  "idnyc-apply": "idnyc-faq",
};

// The network listing that goes with a library topic.
const DOC_LISTING: Record<string, string> = {
  "nys-id-apply": "res-bbrc-id",
  "nys-id-fees": "res-bbrc-id",
  snap: "res-bbrc-benefits",
  "cash-assistance": "res-bbrc-benefits",
  medicaid: "res-bbrc-benefits",
  "safestart-account": "res-secondstart-account",
  lifeline: "res-connect-phone",
};

const CATEGORIES: [RegExp, AskRequest["listings"][number]["category"]][] = [
  [/\bjobs?\b|\bwork\b|hiring|employ/, "jobs"],
  [/housing|\broom\b|apartment|place to (live|stay)|shelter/, "housing"],
  [/doctor|clinic|counsel|therap|recovery|health|medic/, "health"],
  [/lawyer|legal|advocate/, "legal"],
  [/training|\bclass|certificate|forklift|course/, "training"],
];

export function preparedAnswer(input: AskRequest): AskAnswer {
  const q = input.question.toLowerCase();
  const earlier =
    [...input.history].reverse().find((h) => h.role === "user")?.text ?? "";
  // A short follow-up such as "how much does it cost?" leans on the
  // question before it.
  const topicText = TOPICS.some(([re]) => re.test(q))
    ? q
    : `${q} ${earlier.toLowerCase()}`;

  let docId = TOPICS.find(([re]) => re.test(topicText))?.[1];
  if (docId && ABOUT_COST.test(q)) docId = COST_DOCS[docId] ?? docId;
  const doc = LIBRARY.find((d) => d.id === docId);

  // A library topic brings its own network listing, when there is one.
  // Otherwise the kind of help asked for picks the listing.
  const category = doc ? undefined : CATEGORIES.find(([re]) => re.test(q))?.[1];
  const asked = q.split(/[^a-z]+/).filter((w) => w.length > 3);
  const fit = (l: AskRequest["listings"][number]) =>
    asked.filter((w) => `${l.name} ${l.offers}`.toLowerCase().includes(w))
      .length *
      2 +
    (l.borough === input.context.borough ? 1 : 0) +
    (l.fairChance ? 1 : 0);
  const listing = doc
    ? input.listings.find((l) => l.id === DOC_LISTING[doc.id])
    : input.listings
        .filter((l) => l.category === category)
        .sort((x, y) => fit(y) - fit(x))[0];

  if (doc) {
    const lines = [
      "I can't write a full answer right now. Here is what the verified library says on this topic.",
      doc.text,
    ];
    if (doc.id === "entri-order" && input.context.currentStep) {
      lines.push(`Your open step right now is "${input.context.currentStep}".`);
    }
    if (listing) {
      lines.push(
        `In the Entri network, ${listing.name} at ${listing.org} may help. ${listing.howToApply}`,
      );
    }
    return {
      kind: "answer",
      text: lines.join("\n"),
      sources: [doc.id, ...(listing ? [listing.id] : [])].flatMap(
        (id) => asSource(id, input.listings) ?? [],
      ),
      offerAdvocate: doc.id === "fair-chance-act",
    };
  }

  if (listing) {
    return {
      kind: "answer",
      text: [
        "I can't write a full answer right now. Here is a place in the Entri network that may help.",
        `${listing.name} at ${listing.org}, in ${listing.borough}. ${listing.offers} ${listing.howToApply}`,
      ].join("\n"),
      sources: [asSource(listing.id, input.listings)].flatMap((x) => x ?? []),
      offerAdvocate: false,
    };
  }

  return {
    kind: "unknown",
    text: UNKNOWN_TEXT,
    sources: [],
    offerAdvocate: false,
  };
}
