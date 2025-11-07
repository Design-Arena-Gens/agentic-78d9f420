import { NextResponse } from "next/server";
import { generateLeadFollowupPrompt } from "@/lib/aiAgent";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { prisma } = await import("@/lib/prisma");
  const lead = await prisma.lead.findUnique({
    where: { id: params.id }
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const script = await generateLeadFollowupPrompt({
    leadName: lead.fullName,
    exam: lead.targetExam,
    latestStatus: lead.status,
    notes: lead.notes
  });

  return NextResponse.json({ script });
}
