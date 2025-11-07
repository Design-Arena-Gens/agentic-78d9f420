import DashboardView from "@/components/dashboard-view";
import type { LeadWithCalls, AgentScriptType } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  let leads: LeadWithCalls[] = [];
  let script: AgentScriptType | null = null;

  if (hasDatabase) {
    const [{ prisma }, { ensureDefaultScript }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/aiAgent")
    ]);
    const [dbLeads, defaultScript] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          calls: {
            orderBy: { startedAt: "desc" },
            take: 5
          }
        }
      }),
      ensureDefaultScript()
    ]);
    leads = dbLeads as LeadWithCalls[];
    script = defaultScript;
  }

  const fallbackScript: AgentScriptType = {
    id: "placeholder",
    name: "Ananya Sharma",
    persona:
      "Warm, confident admissions counsellor representing Victory Cadets Academy.",
    greeting:
      "Hello! This is Ananya from Victory Cadets Academy. Am I speaking with the parent or guardian of the aspiring cadet?",
    pitch:
      "We specialise in preparing students for Sainik School, RMS, and Navodaya entrance exams with a proven track record. I would love to schedule a free demo class so your child can experience our teaching style and disciplined mentoring.",
    objectionHandling:
      "I completely understand you want the best guidance. The demo class is absolutely free and gives you a clear action plan tailored for your child.",
    closing:
      "Shall we book a convenient slot for the free demo class? It takes just a moment and helps you make an informed decision.",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <DashboardView
      initialLeads={JSON.parse(JSON.stringify(leads))}
      script={JSON.parse(JSON.stringify(script ?? fallbackScript))}
    />
  );
}
