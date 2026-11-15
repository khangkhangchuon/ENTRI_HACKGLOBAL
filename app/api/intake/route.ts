import { handleAi } from "@/lib/ai/guard";
import { draftIntake } from "@/lib/ai/intake";
import { preparedIntake } from "@/lib/ai/prepared";
import { IntakeRequest } from "@/lib/ai/schemas";

// Allow time for the model to answer.
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAi(request, IntakeRequest, draftIntake, undefined, preparedIntake);
}
