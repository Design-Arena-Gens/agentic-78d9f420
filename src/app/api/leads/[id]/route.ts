import { NextResponse } from "next/server";
import { LeadStatus, TargetExam } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().min(8).optional(),
  email: z.string().email().nullable().optional(),
  studentName: z.string().nullable().optional(),
  studentClass: z.string().nullable().optional(),
  targetExam: z.nativeEnum(TargetExam).nullable().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { prisma } = await import("@/lib/prisma");
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      email: parsed.data.email ?? undefined,
      studentName: parsed.data.studentName ?? undefined,
      studentClass: parsed.data.studentClass ?? undefined,
      targetExam: parsed.data.targetExam ?? undefined,
      notes: parsed.data.notes ?? undefined,
      tags: parsed.data.tags ?? undefined
    }
  });

  return NextResponse.json({ lead });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { prisma } = await import("@/lib/prisma");
  await prisma.callRecord.deleteMany({
    where: { leadId: params.id }
  });
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
