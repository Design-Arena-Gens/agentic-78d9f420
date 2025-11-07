'use client';

import type { AgentScriptType } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

interface ScriptCardProps {
  script: AgentScriptType;
  onScriptUpdated: () => Promise<void> | void;
}

export default function ScriptCard({ script, onScriptUpdated }: ScriptCardProps) {
  const [editingField, setEditingField] = useState<keyof AgentScriptType | null>(null);
  const [formState, setFormState] = useState(script);
  const [isSaving, setIsSaving] = useState(false);

  const saveField = async (field: keyof AgentScriptType, value: string) => {
    try {
      setIsSaving(true);
      const resp = await fetch(`/api/scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });

      if (!resp.ok) {
        throw new Error("Failed to update script");
      }

      toast.success("Agent script updated");
      setFormState((prev) => ({ ...prev, [field]: value }));
      setEditingField(null);
      await onScriptUpdated();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (label: string, field: keyof AgentScriptType, value?: string | null) => (
    <div key={field}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        <button
          type="button"
          onClick={() => setEditingField(field)}
          className="text-xs font-medium text-brand-200 hover:text-brand-100"
        >
          Edit
        </button>
      </div>
      {editingField === field ? (
        <div className="mt-2 space-y-2">
          <textarea
            defaultValue={value ?? ""}
            onBlur={(event) => saveField(field, event.target.value)}
            rows={4}
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {isSaving && <p className="text-xs text-slate-400">Saving...</p>}
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{value}</p>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-slate-900 p-6 text-slate-100 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-brand-200">AI Sales Executive</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{script.name}</h2>
      <p className="mt-1 text-sm text-slate-200">{script.persona}</p>
      <div className="mt-4 space-y-4">
        {renderField("Greeting", "greeting", script.greeting)}
        {renderField("Core Pitch", "pitch", script.pitch)}
        {renderField("Handling Objections", "objectionHandling", script.objectionHandling)}
        {renderField("Closing", "closing", script.closing)}
      </div>
    </section>
  );
}
