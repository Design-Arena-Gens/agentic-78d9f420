'use client';

import { useState } from "react";
import { LeadSource, TargetExam, TargetExamList, LeadSourceList } from "@/types";
import { toast } from "sonner";

interface LeadFormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  studentName: string;
  studentClass: string;
  targetExam: TargetExam;
  source: LeadSource;
  notes: string;
}

interface LeadFormDialogProps {
  onSuccess: () => Promise<void> | void;
  exams: readonly TargetExam[];
  sources: readonly LeadSource[];
}

const createInitialState = (): LeadFormState => ({
  fullName: "",
  phoneNumber: "",
  email: "",
  studentName: "",
  studentClass: "",
  targetExam: TargetExamList[0],
  source: (LeadSourceList.includes("MANUAL") ? "MANUAL" : LeadSourceList[0]) as LeadSource,
  notes: ""
});

export default function LeadFormDialog({ onSuccess, exams, sources }: LeadFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<LeadFormState>(createInitialState());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const resp = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });

      if (!resp.ok) {
        const error = await resp.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to create lead");
      }

      toast.success("Lead captured successfully");
      setFormState(createInitialState());
      setOpen(false);
      await onSuccess();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-200"
      >
        Add Manual Lead
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-6">
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Add New Lead</h2>
            <p className="mt-1 text-sm text-slate-500">
              Capture new enquiries from walk-ins, WhatsApp, or referrals.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Full Name
                <input
                  required
                  value={formState.fullName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Phone Number
                <input
                  required
                  value={formState.phoneNumber}
                  onChange={(event) => setFormState((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Email
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Student Name
                <input
                  value={formState.studentName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, studentName: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Class / Standard
                <input
                  value={formState.studentClass}
                  onChange={(event) => setFormState((prev) => ({ ...prev, studentClass: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Target Exam
                <select
                  value={formState.targetExam}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, targetExam: event.target.value as TargetExam }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  {exams.map((exam) => (
                    <option key={exam} value={exam}>
                      {formatLabel(exam)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Lead Source
                <select
                  value={formState.source}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, source: event.target.value as LeadSource }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {formatLabel(source)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              Notes
              <textarea
                rows={4}
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-400 disabled:bg-brand-300"
              >
                {isSaving ? "Saving..." : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
