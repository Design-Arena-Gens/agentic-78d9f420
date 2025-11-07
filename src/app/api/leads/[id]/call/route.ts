import { NextResponse } from "next/server";
import { createOutboundCall } from "@/lib/twilio";
import { ensureDefaultScript } from "@/lib/aiAgent";

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

  const fromNumber = process.env.TWILIO_CALLER_ID;
  const baseUrl = process.env.PUBLIC_URL ?? "https://agentic-78d9f420.vercel.app";

  if (!fromNumber) {
    return NextResponse.json(
      { error: "TWILIO_CALLER_ID environmental variable is missing" },
      { status: 500 }
    );
  }

  const script = await ensureDefaultScript();

  const response = await createOutboundCall({
    to: lead.phoneNumber,
    from: fromNumber,
    url: `${baseUrl}/api/voice/outbound?leadId=${lead.id}&scriptId=${script.id}`,
    statusCallback: `${baseUrl}/api/voice/status?leadId=${lead.id}`
  });

  await prisma.callRecord.create({
    data: {
      id: response.sid,
      leadId: lead.id,
      direction: "OUTBOUND",
      disposition: "PENDING"
    }
  });

  return NextResponse.json({ sid: response.sid });
}
