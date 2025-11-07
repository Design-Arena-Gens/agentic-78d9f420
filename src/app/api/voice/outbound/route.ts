import { NextResponse } from "next/server";
import { getVoiceResponse } from "@/lib/twilio";

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return new NextResponse("<Response><Say>Database offline.</Say></Response>", {
      status: 500,
      headers: { "Content-Type": "text/xml" }
    });
  }
  const { prisma } = await import("@/lib/prisma");
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId");
  const scriptId = searchParams.get("scriptId");

  if (!leadId || !scriptId) {
    return new NextResponse("<Response><Say>Missing parameters.</Say></Response>", {
      status: 400,
      headers: { "Content-Type": "text/xml" }
    });
  }

  const script = await prisma.agentScript.findUnique({ where: { id: scriptId } });
  if (!script) {
    return new NextResponse("<Response><Say>Script not found.</Say></Response>", {
      status: 404,
      headers: { "Content-Type": "text/xml" }
    });
  }

  const xml = getVoiceResponse({
    greeting: script.greeting,
    pitch: script.pitch,
    objectionHandling: script.objectionHandling,
    closing: script.closing,
    leadId
  });

  return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
