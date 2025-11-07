import { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

async function parseFormData(request: Request) {
  const text = await request.text();
  return new URLSearchParams(text);
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    const response = new VoiceResponse();
    response.say("We are currently offline. Please call back later.");
    response.hangup();
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  }
  const { prisma } = await import("@/lib/prisma");
  const params = await parseFormData(request);
  const leadId = params.get("leadId") ?? new URL(request.url).searchParams.get("leadId") ?? undefined;
  const speech = params.get("SpeechResult");

  if (!leadId) {
    const response = new VoiceResponse();
    response.say("Sorry, we could not identify this caller. Goodbye!");
    response.hangup();
    return new NextResponse(response.toString(), { headers: { "Content-Type": "text/xml" } });
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    const response = new VoiceResponse();
    response.say("We could not find your information. Please contact our office directly.");
    response.hangup();
    return new NextResponse(response.toString(), { headers: { "Content-Type": "text/xml" } });
  }

  const response = new VoiceResponse();

  if (speech && /yes|sure|ok|schedule|book/i.test(speech)) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.DEMO_SCHEDULED,
        notes: [
          lead.notes ?? "",
          `Auto-call: prospect verbally confirmed interest. Transcript: "${speech}".`
        ]
          .filter(Boolean)
          .join("\n")
      }
    });

    response.say(
      {
        voice: "Polly.Aditi",
        language: "en-IN"
      },
      "Wonderful! I will send you a WhatsApp message right away with demo class slots and meeting link. Looking forward to seeing your child in the session."
    );
    response.say("Thank you for your time. Jai Hind!");
    response.hangup();
  } else if (speech && /not interested|stop|no/i.test(speech)) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.LOST,
        notes: [
          lead.notes ?? "",
          `Auto-call: prospect declined. Transcript: "${speech}".`
        ]
          .filter(Boolean)
          .join("\n")
      }
    });
    response.say("Thank you for your honesty. If you change your mind, we are always here to support your child's dream.");
    response.hangup();
  } else {
    response.say(
      {
        voice: "Polly.Aditi",
        language: "en-IN"
      },
      "I completely understand. Just to recap, the demo class is completely free and gives you a clear plan for Sainik, RMS, or Navodaya preparation. Would you like me to reserve a seat for your child?"
    );
    response.redirect({ method: "POST" }, "/api/voice/objection");
  }

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" }
  });
}
