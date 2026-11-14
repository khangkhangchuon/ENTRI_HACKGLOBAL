import type { AskListing } from "@/lib/ai/schemas";
import { LIBRARY, type LibraryDoc } from "./library";

// A plain keyword search. It finds the library entries and network listings
// that best match the question, so the AI only ever sees those.

const STOP = new Set(
  "a an and are as at be but by can do does for from get have how i if in is it me my need of on or so that the there this to what when where which who will with you your am im was were would should could about any some much many".split(
    " ",
  ),
);

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w))
    .filter((w) => w.length > 1 && !STOP.has(w));

function score(query: string, queryWords: string[], strong: string, weak: string): number {
  const strongText = strong.toLowerCase();
  const weakWords = new Set(words(weak));
  let total = 0;
  for (const w of queryWords) {
    if (strongText.includes(w)) total += 3;
    else if (weakWords.has(w)) total += 1;
  }
  // A whole phrase from the keywords, such as "food stamps", counts extra.
  for (const phrase of strong.toLowerCase().split("|")) {
    if (phrase.includes(" ") && query.includes(phrase.trim())) total += 4;
  }
  return total;
}

export function findDocs(question: string, limit = 4): LibraryDoc[] {
  const query = question.toLowerCase();
  const queryWords = words(question);
  return LIBRARY.map((doc) => ({
    doc,
    score: score(query, queryWords, `${doc.title}|${doc.keywords.join("|")}`, doc.text),
  }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.doc);
}

const CATEGORY_WORDS: Record<string, string> = {
  jobs: "job jobs work hire hiring employer employment record warehouse cook kitchen",
  housing: "housing home room apartment place stay shelter bed rent",
  health: "health doctor clinic counseling therapy recovery substance treatment medical",
  legal: "legal lawyer advocate record rights family",
  "id-benefits": "id identification benefits phone bank account snap medicaid",
  training: "training class course certificate forklift trade school learn",
};

export function findListings(question: string, listings: AskListing[], limit = 4): AskListing[] {
  const query = question.toLowerCase();
  const queryWords = words(question);
  return listings
    .map((l) => ({
      l,
      score: score(
        query,
        queryWords,
        `${l.name}|${l.org}|${CATEGORY_WORDS[l.category] ?? ""}`,
        `${l.offers} ${l.borough}`,
      ),
    }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l);
}
