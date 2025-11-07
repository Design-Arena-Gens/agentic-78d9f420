import { CallDisposition, CallDirection } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true });
  }
  const { prisma } = await import("@/lib/prisma");
  const payload = new URLSearchParams(await request.text());
  const leadId = payload.get("leadId");
  const callSid = payload.get("CallSid") ?? "";
  const callStatus = payload.get("CallStatus") ?? "unknown";
  const recordingUrl = payload.get("RecordingUrl") ?? undefined;
  const durationSeconds = payload.get("CallDuration") ?? undefined;

  if (!leadId) {
    return NextResponse.json({ ok: true });
  }

  await prisma.callRecord.upsert({
    where: { id: callSid },
    create: {
      id: callSid,
      leadId,
      direction: CallDirection.OUTBOUND,
      disposition: mapStatus(callStatus),
      recordingUrl,
      outcomeNotes: durationSeconds ? `Duration: ${durationSeconds}s` : undefined
    },
    update: {
      disposition: mapStatus(callStatus),
      recordingUrl,
      outcomeNotes: durationSeconds ? `Duration: ${durationSeconds}s` : undefined
    }
  });

  if (callStatus === "completed") {
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContactedAt: new Date() }
    });
  }

  return NextResponse.json({ ok: true });
}

function mapStatus(status: string): CallDisposition {
  switch (status) {
    case "completed":
      return CallDisposition.COMPLETED;
    case "no-answer":
    case "busy":
      return CallDisposition.NO_ANSWER;
    case "failed":
    case "canceled":
      return CallDisposition.FAILED;
    default:
      return CallDisposition.PENDING;
  }
}
