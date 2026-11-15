import { handleAi } from "@/lib/ai/guard";
import { draftGaps } from "@/lib/ai/gaps";
import { preparedGaps } from "@/lib/ai/prepared";
import { GapsRequest } from "@/lib/ai/schemas";

// Allow time for the model to answer.
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAi(request, GapsRequest, draftGaps, undefined, preparedGaps);
}
