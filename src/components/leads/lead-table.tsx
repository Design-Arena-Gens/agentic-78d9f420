'use client';

import { Fragment, useState } from "react";
import type { LeadWithCalls, LeadStatus } from "@/types";
import { toast } from "sonner";
import LeadStatusBadge from "@/components/leads/lead-status-badge";
import { PhoneCall, MessageSquareText, FileText } from "lucide-react";

interface LeadTableProps {
  leads: LeadWithCalls[];
  onLeadsChange: (leads: LeadWithCalls[]) => void;
}

export default function LeadTable({ leads, onLeadsChange }: LeadTableProps) {
  const [activeScript, setActiveScript] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState<string>("");
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    const resp = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!resp.ok) {
      toast.error("Failed to update lead status");
      return;
    }

    const json = await resp.json();
    onLeadsChange(leads.map((lead) => (lead.id === leadId ? { ...lead, ...json.lead } : lead)));
  };

  const triggerCall = async (leadId: string) => {
    try {
      setLoadingLeadId(leadId);
      const resp = await fetch(`/api/leads/${leadId}/call`, { method: "POST" });
      if (!resp.ok) {
        const error = await resp.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to initiate call");
      }
      toast.success("Outbound call triggered successfully");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoadingLeadId(null);
    }
  };

  const fetchScript = async (leadId: string) => {
    try {
      setLoadingLeadId(leadId);
      const resp = await fetch(`/api/leads/${leadId}/script`, { method: "POST" });
      if (!resp.ok) {
        throw new Error("Failed to generate follow-up script");
      }
      const json = await resp.json();
      setScriptContent(json.script);
      setActiveScript(leadId);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoadingLeadId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Lead Pipeline</h2>
        <p className="text-sm text-slate-300">Auto-synced from ads + manual additions</p>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm text-slate-200">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="py-3 pr-4 font-medium">Lead</th>
              <th className="py-3 pr-4 font-medium">Exam</th>
              <th className="py-3 pr-4 font-medium">Source</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Last Contact</th>
              <th className="py-3 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead) => (
              <Fragment key={lead.id}>
                <tr className="align-top hover:bg-white/5">
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-white">{lead.fullName}</div>
                    <div className="text-xs text-slate-400">{lead.phoneNumber}</div>
                    {lead.email && <div className="text-xs text-slate-400">{lead.email}</div>}
                    {lead.notes && <p className="mt-1 text-xs text-slate-300">{lead.notes}</p>}
                  </td>
                  <td className="py-4 pr-4 capitalize text-slate-300">{formatLabel(lead.targetExam)}</td>
                  <td className="py-4 pr-4 text-slate-300">{formatLabel(lead.source)}</td>
                  <td className="py-4 pr-4">
                    <LeadStatusBadge
                      status={lead.status}
                      onStatusChange={(status) => updateLeadStatus(lead.id, status)}
                    />
                  </td>
                  <td className="py-4 pr-4 text-xs text-slate-400">
                    {lead.lastContactedAt
                      ? new Date(lead.lastContactedAt).toLocaleString()
                      : "No contact yet"}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => triggerCall(lead.id)}
                        disabled={loadingLeadId === lead.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-brand-400 disabled:bg-brand-600"
                      >
                        <PhoneCall className="h-4 w-4" />
                        {loadingLeadId === lead.id ? "Connecting..." : "Auto Call"}
                      </button>
                      <button
                        type="button"
                        onClick={() => fetchScript(lead.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-brand-500 hover:text-brand-200"
                      >
                        <MessageSquareText className="h-4 w-4" />
                        Follow-up Script
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const value = window.prompt("Update notes", lead.notes ?? "");
                          if (value === null) return;
                          const resp = await fetch(`/api/leads/${lead.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ notes: value })
                          });
                          if (!resp.ok) {
                            toast.error("Failed to update notes");
                            return;
                          }
                          const json = await resp.json();
                          onLeadsChange(leads.map((item) => (item.id === lead.id ? { ...item, ...json.lead } : item)));
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                      >
                        <FileText className="h-4 w-4" />
                        Notes
                      </button>
                    </div>
                  </td>
                </tr>
                {activeScript === lead.id && (
                  <tr>
                    <td colSpan={6} className="bg-slate-900/80 p-4 text-sm text-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="whitespace-pre-wrap">{scriptContent}</div>
                        <button
                          type="button"
                          onClick={() => setActiveScript(null)}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
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
