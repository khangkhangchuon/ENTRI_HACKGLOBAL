"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { bigSecondary } from "@/components/user/app-shell";
import { UserResourceCard } from "@/components/user/resource-card";
import { StepDoneButton } from "@/components/user/step-done";
import { selectMainClient, useDemo } from "@/lib/demo/store";

export default function StepPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const me = useDemo(selectMainClient);
  const resources = useDemo((s) => s.resources);
  const step = me.plan.find((s) => s.id === stepId);
  const index = step ? me.plan.indexOf(step) : -1;

  if (!step || step.status === "locked") {
    return (
      <div className="px-5 py-6 text-lg">
        <p>
          {step
            ? `This step opens after "${me.plan[index - 1]?.title}".`
            : "This step is not in your plan."}
        </p>
        <Link href="/app/plan" className={`${bigSecondary} mt-4`}>
          Back to my plan
        </Link>
      </div>
    );
  }

  const places = step.resourceIds.flatMap(
    (id) => resources.find((r) => r.id === id) ?? [],
  );

  return (
    <div className="px-5 pb-8 pt-4 text-lg">
      <Link
        href="/app/plan"
        className="inline-flex items-center gap-1.5 font-semibold text-ember-700"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        My plan
      </Link>
      <p className="mt-3 text-[15px] font-semibold text-ember-700">
        Step {index + 1} of {me.plan.length}
      </p>
      <h1 className="font-display text-3xl leading-tight">{step.title}</h1>
      {step.status === "done" && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-moss-100 px-3 py-1 font-semibold text-moss-700">
          <Check className="h-5 w-5" aria-hidden />
          You did this
        </p>
      )}

      <h2 className="mt-5 text-[15px] font-semibold text-ink-soft">
        What to do
      </h2>
      <p>{step.what}</p>
      <h2 className="mt-4 text-[15px] font-semibold text-ink-soft">
        Where to go
      </h2>
      <p>{step.where}</p>
      {step.bring.length > 0 && (
        <>
          <h2 className="mt-4 text-[15px] font-semibold text-ink-soft">
            What to bring
          </h2>
          <ul className="list-disc pl-5">
            {step.bring.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 space-y-2.5">
        <StepDoneButton stepId={step.id} />
        <Link href={`/app/ask?step=${step.id}`} className={bigSecondary}>
          <MessageCircle className="h-5 w-5" aria-hidden />
          Ask about this step
        </Link>
      </div>

      {places.length > 0 && (
        <>
          <h2 className="mt-7 font-display text-2xl">
            Places that help with this
          </h2>
          <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
            {places.map((r) => (
              <UserResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
