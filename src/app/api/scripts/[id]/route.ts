import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().optional(),
  persona: z.string().optional(),
  greeting: z.string().optional(),
  pitch: z.string().optional(),
  objectionHandling: z.string().optional(),
  closing: z.string().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { prisma } = await import("@/lib/prisma");
  const data = await request.json();
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const script = await prisma.agentScript.update({
    where: { id: params.id },
    data: parsed.data
  });

  return NextResponse.json({ script });
}
