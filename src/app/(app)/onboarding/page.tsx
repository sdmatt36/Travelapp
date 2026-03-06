"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepFamilyBasics } from "@/components/features/family/StepFamilyBasics";
import { StepFamilyMembers } from "@/components/features/family/StepFamilyMembers";
import { StepInterests } from "@/components/features/family/StepInterests";
import { Progress } from "@/components/ui/progress";

export type FamilyMemberInput = {
  role: "ADULT" | "CHILD";
  birthDate?: string;
  dietaryRequirements: string[];
};

export type OnboardingData = {
  familyName: string;
  homeCity: string;
  homeCountry: string;
  travelFrequency: string;
  members: FamilyMemberInput[];
  interestKeys: string[];
};

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    familyName: "",
    homeCity: "",
    homeCountry: "",
    travelFrequency: "",
    members: [],
    interestKeys: [],
  });

  const progress = (step / TOTAL_STEPS) * 100;

  const handleNext = (update: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...update }));
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (update: Partial<OnboardingData>) => {
    const final = { ...data, ...update };
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push("/home");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of {TOTAL_STEPS}</span>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 pt-20 pb-8 px-6">
        <div className="max-w-lg mx-auto">
          {step === 1 && (
            <StepFamilyBasics
              data={data}
              onNext={(update) => handleNext(update)}
            />
          )}
          {step === 2 && (
            <StepFamilyMembers
              data={data}
              onNext={(update) => handleNext(update)}
            />
          )}
          {step === 3 && (
            <StepInterests
              data={data}
              onComplete={(update) => handleComplete(update)}
              saving={saving}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
