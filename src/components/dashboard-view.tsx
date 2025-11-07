'use client';

import { useMemo, useState, useTransition } from "react";
import type { LeadWithCalls, AgentScriptType } from "@/types";
import { LeadStatusList, LeadSourceList, TargetExamList } from "@/types";
import LeadTable from "@/components/leads/lead-table";
import LeadFormDialog from "@/components/leads/lead-form-dialog";
import ScriptCard from "@/components/scripts/script-card";
import MetricsBar from "@/components/metrics/metrics-bar";
import { toast } from "sonner";

interface DashboardViewProps {
  initialLeads: LeadWithCalls[];
  script: AgentScriptType;
}

export default function DashboardView({ initialLeads, script }: DashboardViewProps) {
  const [leads, setLeads] = useState<LeadWithCalls[]>(initialLeads);
  const [isSyncing, startSyncTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const metrics = useMemo(() => {
    const total = leads.length;
    const byStatus = LeadStatusList.reduce<Record<string, number>>((acc, status) => {
      acc[status] = leads.filter((lead) => lead.status === status).length;
      return acc;
    }, {});
    const demoScheduled = byStatus["DEMO_SCHEDULED"] ?? 0;
    const enrolled = byStatus["ENROLLED"] ?? 0;

    return {
      total,
      demoScheduled,
      enrolled,
      conversionRate: total ? Math.round((enrolled / total) * 100) : 0
    };
  }, [leads]);

  const refreshLeads = async () => {
    const resp = await fetch("/api/leads");
    if (!resp.ok) {
      toast.error("Failed to refresh leads");
      return;
    }
    const json = await resp.json();
    setLeads(json.leads);
  };

  const handleSync = () => {
    startSyncTransition(async () => {
      const resp = await fetch("/api/leads/sync", { method: "POST" });
      if (!resp.ok) {
        const error = await resp.json().catch(() => ({}));
        toast.error(`Sync failed: ${error.error ?? resp.statusText}`);
        return;
      }
      const json = await resp.json();
      toast.success(`Sync complete: ${json.report.created} new leads`);
      await refreshLeads();
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const resp = await fetch("/api/leads/export");
      if (!resp.ok) {
        toast.error("Failed to export leads");
        return;
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "victory-cadets-leads.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Lead spreadsheet downloaded");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredLeads = leads;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Victory Cadets Command Centre</h1>
            <p className="text-slate-300">
              Automate lead capture, smart outreach, and counselling for Sainik School, RMS, and Navodaya aspirants.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:flex-row">
            <LeadFormDialog onSuccess={refreshLeads} exams={TargetExamList} sources={LeadSourceList} />
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-400 disabled:bg-slate-600"
            >
              {isSyncing ? "Syncing..." : "Sync Ads Leads"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-200 hover:bg-brand-500/10 disabled:border-slate-600 disabled:text-slate-400"
            >
              {isExporting ? "Preparing…" : "Export Excel"}
            </button>
          </div>
        </header>

        <MetricsBar metrics={metrics} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LeadTable leads={filteredLeads} onLeadsChange={setLeads} />
          </div>
          <div className="flex flex-col gap-6">
            <ScriptCard script={script} onScriptUpdated={refreshLeads} />
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">Automation Checklist</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>• Connect Facebook Lead Form IDs via `FACEBOOK_LEAD_FORM_IDS`.</li>
                <li>• Configure Google Ads API credentials to auto-pull enquiries.</li>
                <li>• Verify Twilio numbers for outbound & inbound call routing.</li>
                <li>• Set `PUBLIC_URL` to production domain before deployment.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
