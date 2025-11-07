import { NextResponse } from "next/server";
import { fetchFacebookLeads, normalizeFacebookLead } from "@/lib/facebook";
import { fetchGoogleLeads, normalizeGoogleLead } from "@/lib/googleAds";
import { LeadStatus, TargetExam } from "@prisma/client";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { prisma } = await import("@/lib/prisma");
  const report: Record<string, number> = {
    created: 0,
    skipped: 0
  };

  const results: string[] = [];

  try {
    const fbFormIds = process.env.FACEBOOK_LEAD_FORM_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];

    for (const formId of fbFormIds) {
      const fbLeads = await fetchFacebookLeads(formId);
      for (const lead of fbLeads) {
        const normalized = normalizeFacebookLead(lead);
        const existing = await prisma.lead.findUnique({
          where: { sourceLeadId: normalized.sourceLeadId }
        });
        if (existing) {
          report.skipped += 1;
          continue;
        }
        await prisma.lead.create({
          data: {
            fullName: normalized.fullName,
            phoneNumber: normalized.phoneNumber,
            email: normalized.email,
            studentName: normalized.studentName,
            studentClass: normalized.studentClass,
            targetExam: normalizeTargetExam(normalized.targetExam),
            source: normalized.source,
            sourceLeadId: normalized.sourceLeadId,
            tags: normalized.tags ?? [],
            status: LeadStatus.NEW
          }
        });
        report.created += 1;
      }
      results.push(`Facebook form ${formId}: ${fbLeads.length} processed`);
    }
  } catch (error) {
    results.push(`Facebook sync failed: ${(error as Error).message}`);
  }

  try {
    const googleLeads = await fetchGoogleLeads();
    for (const lead of googleLeads) {
      const normalized = normalizeGoogleLead(lead);
      const existing = await prisma.lead.findUnique({
        where: { sourceLeadId: normalized.sourceLeadId }
      });
      if (existing) {
        report.skipped += 1;
        continue;
      }
      await prisma.lead.create({
        data: {
          fullName: normalized.fullName,
          phoneNumber: normalized.phoneNumber,
          email: normalized.email,
          studentName: normalized.studentName,
          studentClass: normalized.studentClass,
          targetExam: normalizeTargetExam(normalized.targetExam),
          source: normalized.source,
          sourceLeadId: normalized.sourceLeadId,
          tags: normalized.tags ?? [],
          status: LeadStatus.NEW
        }
      });
      report.created += 1;
    }
    results.push(`Google Ads: ${googleLeads.length} processed`);
  } catch (error) {
    results.push(`Google Ads sync failed: ${(error as Error).message}`);
  }

  return NextResponse.json({ report, results });
}

function normalizeTargetExam(input?: string) {
  if (!input) {
    return TargetExam.OTHER;
  }
  const normalized = input.toUpperCase();
  if (normalized.includes("SAINIK")) return TargetExam.SAINIK_SCHOOL;
  if (normalized.includes("RMS") || normalized.includes("MILITARY")) return TargetExam.RASHTRIYA_MILITARY_SCHOOL;
  if (normalized.includes("NAVODAYA")) return TargetExam.NAVODAYA;
  return TargetExam.OTHER;
}
