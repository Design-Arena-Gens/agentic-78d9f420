'use client';

import { LeadStatusList, LeadStatus } from "@/types";
import { useState } from "react";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-slate-600 text-white",
  CONTACTED: "bg-blue-600 text-white",
  FOLLOW_UP: "bg-amber-500 text-slate-900",
  DEMO_SCHEDULED: "bg-emerald-500 text-slate-900",
  DEMO_COMPLETED: "bg-emerald-700 text-white",
  ENROLLED: "bg-brand-500 text-white",
  LOST: "bg-rose-500 text-white"
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
}

export default function LeadStatusBadge({ status, onStatusChange }: LeadStatusBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${statusStyles[status]}`}
      >
        {formatLabel(status)}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-10 min-w-[180px] rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-lg backdrop-blur">
          {LeadStatusList.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onStatusChange(item);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-start rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-100 hover:bg-white/10 ${
                item === status ? "bg-white/10" : ""
              }`}
            >
              {formatLabel(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
