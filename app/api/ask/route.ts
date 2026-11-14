import { answerQuestion, answerWithoutAi } from "@/lib/ai/ask";
import { handleAi } from "@/lib/ai/guard";
import { AskRequest } from "@/lib/ai/schemas";

// Allow time for the model to answer.
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAi(request, AskRequest, answerQuestion, answerWithoutAi);
}
