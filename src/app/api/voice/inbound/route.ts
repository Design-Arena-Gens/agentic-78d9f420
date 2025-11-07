import { LeadSource, LeadStatus, TargetExam } from "@prisma/client";
import { NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    const response = new VoiceResponse();
    response.say("Our admissions desk is currently offline. Please leave a message on WhatsApp.");
    response.hangup();
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  }
  const { prisma } = await import("@/lib/prisma");
  const payload = new URLSearchParams(await request.text());
  const caller = payload.get("From") ?? "Unknown";
  const digits = payload.get("Digits");
  const leadId = payload.get("leadId") ?? new URL(request.url).searchParams.get("leadId") ?? undefined;

  let lead = leadId
    ? await prisma.lead.findUnique({ where: { id: leadId } })
    : await prisma.lead.findFirst({
        where: { phoneNumber: caller }
      });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        fullName: "Unknown Caller",
        phoneNumber: caller,
        source: LeadSource.INBOUND_CALL,
        status: LeadStatus.CONTACTED,
        targetExam: TargetExam.OTHER,
        tags: ["inbound-call"]
      }
    });
  }

  const response = new VoiceResponse();

  if (digits) {
    switch (digits) {
      case "1":
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: LeadStatus.DEMO_SCHEDULED }
        });
        response.say(
          {
            voice: "Polly.Aditi",
            language: "en-IN"
          },
          "Great choice! Our counsellor will call you shortly to finalise the free demo class. Thank you!"
        );
        response.hangup();
        break;
      case "2":
        response.say(
          {
            voice: "Polly.Aditi",
            language: "en-IN"
          },
          "We offer integrated coaching with weekly tests, structured notes, and interview preparation. Classes run online and offline with personalised mentoring. A free demo session is the best way to experience it. Would you like to book one now?"
        );
        response.gather({
          numDigits: 1,
          action: `/api/voice/inbound?leadId=${lead.id}`,
          method: "POST"
        });
        break;
      default:
        response.say("Connecting you to our admissions specialist. Please hold.");
        response.dial(process.env.ROUTING_PHONE_NUMBER ?? caller);
        break;
    }

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  }

  response.say(
    {
      voice: "Polly.Aditi",
      language: "en-IN"
    },
    "Namaste! You have reached Victory Cadets Academy, the leader in Sainik School, RMS, and Navodaya entrance coaching."
  );
  response.say(
    {
      voice: "Polly.Aditi",
      language: "en-IN"
    },
    "Please press 1 to book a free demo class, 2 to know about course structure, or stay on the line to talk to our counsellor."
  );
  response.gather({
    numDigits: 1,
    action: `/api/voice/inbound?leadId=${lead.id}`,
    method: "POST"
  });

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" }
  });
}
