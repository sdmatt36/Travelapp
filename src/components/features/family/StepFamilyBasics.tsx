"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingData } from "@/app/(app)/onboarding/page";

const FREQUENCY_OPTIONS = [
  { value: "ONE_TWO", label: "1–2 times a year" },
  { value: "THREE_FIVE", label: "3–5 times a year" },
  { value: "SIX_PLUS", label: "6+ times a year" },
];

interface Props {
  data: OnboardingData;
  onNext: (update: Partial<OnboardingData>) => void;
}

export function StepFamilyBasics({ data, onNext }: Props) {
  const [familyName, setFamilyName] = useState(data.familyName);
  const [homeCity, setHomeCity] = useState(data.homeCity);
  const [homeCountry, setHomeCountry] = useState(data.homeCountry);
  const [travelFrequency, setTravelFrequency] = useState(data.travelFrequency);

  const canContinue = homeCity.trim() && homeCountry.trim() && travelFrequency;

  return (
    <div className="space-y-8 pt-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Let's get started
        </h1>
        <p className="text-gray-500 text-lg">
          A few quick details about your family — takes about 60 seconds.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="familyName" className="text-gray-700 font-medium">
            Family name <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="familyName"
            placeholder="e.g. The Johnsons"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeCity" className="text-gray-700 font-medium">
              Home city <span className="text-red-400">*</span>
            </Label>
            <Input
              id="homeCity"
              placeholder="e.g. Chicago"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeCountry" className="text-gray-700 font-medium">
              Country <span className="text-red-400">*</span>
            </Label>
            <Input
              id="homeCountry"
              placeholder="e.g. USA"
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">
            How often does your family travel? <span className="text-red-400">*</span>
          </Label>
          <div className="space-y-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTravelFrequency(opt.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all text-base font-medium ${
                  travelFrequency === opt.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => onNext({ familyName, homeCity, homeCountry, travelFrequency })}
        disabled={!canContinue}
        className="w-full h-12 text-base font-semibold"
      >
        Continue →
      </Button>
    </div>
  );
}
