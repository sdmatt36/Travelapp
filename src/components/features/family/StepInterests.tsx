"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { INTERESTS, INTEREST_CATEGORIES } from "@/types";
import type { OnboardingData } from "@/app/(app)/onboarding/page";

const MIN_SELECTIONS = 3;

interface Props {
  data: OnboardingData;
  onComplete: (update: Partial<OnboardingData>) => void;
  saving?: boolean;
  error?: string | null;
}

export function StepInterests({ data, onComplete, saving, error }: Props) {
  const [selected, setSelected] = useState<string[]>(data.interestKeys);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filtered =
    activeCategory === "ALL"
      ? INTERESTS
      : INTERESTS.filter((i) => i.category === activeCategory);

  const canComplete = selected.length >= MIN_SELECTIONS;

  return (
    <div className="space-y-6 pt-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          What excites your family?
        </h1>
        <p className="text-gray-500 text-lg">
          Pick everything that sounds like you. No wrong answers.
        </p>
        <p className="text-sm text-gray-400">
          {selected.length < MIN_SELECTIONS
            ? `Select at least ${MIN_SELECTIONS} (${MIN_SELECTIONS - selected.length} more to go)`
            : `${selected.length} selected — looking great!`}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === "ALL"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {INTEREST_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Interest tiles */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((interest) => {
          const isSelected = selected.includes(interest.key);
          return (
            <button
              key={interest.key}
              onClick={() => toggle(interest.key)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
              }`}
            >
              <span className="text-2xl">{interest.emoji}</span>
              <span className="text-sm font-medium leading-tight">
                {interest.label}
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      <div className="sticky bottom-0 bg-white pt-4 pb-2">
        <Button
          onClick={() => onComplete({ interestKeys: selected })}
          disabled={!canComplete || saving}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {saving
            ? "Saving..."
            : canComplete
            ? "Let's go →"
            : `Select ${MIN_SELECTIONS - selected.length} more to continue`}
        </Button>
      </div>
    </div>
  );
}
