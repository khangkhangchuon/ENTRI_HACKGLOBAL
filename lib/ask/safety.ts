// Checks that run before any AI. They are plain pattern matches, so they
// work even when the AI cannot be reached.

const CRISIS =
  /(kill (myself|my self|him|her|them|someone)|suicid|end (my|it) (life|all)|end it all|want to die|wanna die|better off dead|don'?t (see|want) (the|a|any) point|no (point|reason) (anymore|any more|in living|to live|in going on)|can'?t (go on|do this anymore|take it anymore)|hurt (myself|my self|someone|somebody|him|her|them)|harm (myself|my self)|cut myself|overdos|i'?m (not safe|in danger)|someone is (going to|gonna) (hurt|kill))/i;

const LEGAL =
  /\b(parole|probation|p\.?o\.? officer|court|judge|warrant|immigration|deport\w*|lawsuit|sue|custody|expunge\w*|seal(ed|ing)? (my |the |a )?record|is it legal|is it illegal|legally|lawyer|attorney|arrest(ed)?|violat\w*)\b/i;

// Asking for a real person, such as a caseworker or someone on staff.
const PERSON =
  /\b((real|actual|live) (person|human|people)|human being|(talk|speak|chat) (to|with) (a |an |some )?(person|human|someone|somebody|caseworker|case worker|staff|employee|worker|counselor)|need (a |my )?(caseworker|case worker)|get (a |my )?(caseworker|case worker)|not a (bot|robot|computer))\b/i;

export const isCrisis = (text: string) => CRISIS.test(text);
export const isLegal = (text: string) => LEGAL.test(text);
export const wantsPerson = (text: string) => PERSON.test(text);

export const CRISIS_TEXT =
  "I'm glad you told me. What you are feeling matters, and you do not have to carry it alone. A real person can talk with you right now.";

export const LEGAL_TEXT =
  "This is a legal question, so a real person should answer it. I can't give legal advice, and I don't want to guess about something this important.";

export const UNKNOWN_TEXT = "I don't have verified information about that.";

export const PERSON_TEXT = {
  connected:
    "Your caseworker is a real person, and you can message them any time. You can also visit a place in Find help and talk with someone there.",
  solo: "Entri can connect you with a caseworker, a real person who helps you with your plan. You choose what they can see. You can also visit a place in Find help and talk with someone there.",
};
