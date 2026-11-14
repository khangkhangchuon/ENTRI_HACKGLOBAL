import { handleAi } from "@/lib/ai/guard";
import { draftCaseload } from "@/lib/ai/caseload";
import { CaseloadRequest } from "@/lib/ai/schemas";

// Allow time for the model to answer.
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAi(request, CaseloadRequest, draftCaseload);
}
