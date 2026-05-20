"use client";

import { TEMPLATES } from "@/store/useBoothStore";
import { useBoothStore } from "@/store/useBoothStore";
import type { Template } from "@/types";

export default function TemplatePicker() {
  const { selectedTemplate, setTemplate } = useBoothStore();

  return (
    <div className="w-full">
      <p className="text-sm text-neutral-400 mb-4 text-center tracking-widest uppercase">
        Choose a frame
      </p>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate.id === template.id}
            onSelect={setTemplate}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Sub-component ----

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (t: Template) => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={() => onSelect(template)}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
        ${
          isSelected
            ? "border-white scale-105 shadow-lg shadow-white/10"
            : "border-neutral-700 hover:border-neutral-500 hover:scale-102"
        }
      `}
      style={{ backgroundColor: template.bgColor }}>
      {/* Mini photo strip preview */}
      <div className="flex flex-col gap-1 w-full">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-full h-6 rounded-sm opacity-40"
            style={{ backgroundColor: template.accentColor }}
          />
        ))}
      </div>

      {/* Label */}
      <span
        className="text-xs font-semibold tracking-wide"
        style={{ color: template.textColor }}>
        {template.name}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <span className="text-black text-xs">✓</span>
        </div>
      )}
    </button>
  );
}
