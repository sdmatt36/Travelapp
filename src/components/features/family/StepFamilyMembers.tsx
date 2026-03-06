"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { OnboardingData, FamilyMemberInput } from "@/app/(app)/onboarding/page";

const DIETARY_OPTIONS = [
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "HALAL", label: "Halal" },
  { value: "KOSHER", label: "Kosher" },
  { value: "GLUTEN_FREE", label: "Gluten Free" },
  { value: "NUT_FREE", label: "Nut Free" },
  { value: "DAIRY_FREE", label: "Dairy Free" },
];

interface Props {
  data: OnboardingData;
  onNext: (update: Partial<OnboardingData>) => void;
}

function MemberCard({
  member,
  index,
  onChange,
  onRemove,
}: {
  member: FamilyMemberInput;
  index: number;
  onChange: (m: FamilyMemberInput) => void;
  onRemove: () => void;
}) {
  const toggleDietary = (val: string) => {
    const current = member.dietaryRequirements;
    onChange({
      ...member,
      dietaryRequirements: current.includes(val)
        ? current.filter((d) => d !== val)
        : [...current, val],
    });
  };

  return (
    <div className="border-2 border-gray-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700">
          {member.role === "ADULT" ? "👤 Adult" : "🧒 Child"}{" "}
          <span className="text-gray-400 font-normal">#{index + 1}</span>
        </span>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-400 transition-colors text-sm"
        >
          Remove
        </button>
      </div>

      {member.role === "CHILD" && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Date of birth</Label>
          <input
            type="date"
            value={member.birthDate ?? ""}
            onChange={(e) => onChange({ ...member, birthDate: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-400">
            We use birth date (not age) so recommendations stay accurate as your kids grow.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-gray-600">
          Dietary needs <span className="text-gray-400">(optional)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleDietary(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                member.dietaryRequirements.includes(opt.value)
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepFamilyMembers({ data, onNext }: Props) {
  const [members, setMembers] = useState<FamilyMemberInput[]>(
    data.members.length > 0
      ? data.members
      : [{ role: "ADULT", dietaryRequirements: [] }]
  );

  const addMember = (role: "ADULT" | "CHILD") => {
    setMembers((prev) => [...prev, { role, dietaryRequirements: [] }]);
  };

  const updateMember = (index: number, m: FamilyMemberInput) => {
    setMembers((prev) => prev.map((item, i) => (i === index ? m : item)));
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 pt-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Your family</h1>
        <p className="text-gray-500 text-lg">
          Add everyone who travels with you. This is how we tailor recommendations.
        </p>
      </div>

      <div className="space-y-3">
        {members.map((m, i) => (
          <MemberCard
            key={i}
            member={m}
            index={i}
            onChange={(updated) => updateMember(i, updated)}
            onRemove={() => removeMember(i)}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => addMember("ADULT")}
          className="h-12 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all text-sm font-medium"
        >
          + Add adult
        </button>
        <button
          onClick={() => addMember("CHILD")}
          className="h-12 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all text-sm font-medium"
        >
          + Add child
        </button>
      </div>

      <Button
        onClick={() => onNext({ members })}
        disabled={members.length === 0}
        className="w-full h-12 text-base font-semibold"
      >
        Continue →
      </Button>
    </div>
  );
}
