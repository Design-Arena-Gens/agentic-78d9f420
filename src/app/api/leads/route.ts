import { NextResponse } from "next/server";
import { LeadStatus, LeadSource, TargetExam } from "@prisma/client";
import { z } from "zod";

const leadSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().min(8),
  email: z.string().email().nullable().optional(),
  studentName: z.string().min(2).nullable().optional(),
  studentClass: z.string().nullable().optional(),
  targetExam: z.nativeEnum(TargetExam).nullable().optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.MANUAL),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional()
});

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ leads: [] });
  }

  const { prisma } = await import("@/lib/prisma");
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      calls: {
        orderBy: { startedAt: "desc" },
        take: 5
      }
    }
  });

  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { prisma } = await import("@/lib/prisma");
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      fullName: parsed.data.fullName,
      phoneNumber: parsed.data.phoneNumber,
      email: parsed.data.email ?? undefined,
      studentName: parsed.data.studentName ?? undefined,
      studentClass: parsed.data.studentClass ?? undefined,
      targetExam: parsed.data.targetExam ?? TargetExam.OTHER,
      source: parsed.data.source,
      tags: parsed.data.tags ?? [],
      notes: parsed.data.notes ?? undefined,
      status: LeadStatus.NEW
    }
  });

  return NextResponse.json({ lead }, { status: 201 });
}
