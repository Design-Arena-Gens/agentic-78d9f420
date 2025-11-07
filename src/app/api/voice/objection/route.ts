import { NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: Request) {
  const form = await request.text();
  const params = new URLSearchParams(form);
  const leadId = params.get("leadId") ?? new URL(request.url).searchParams.get("leadId") ?? undefined;

  const response = new VoiceResponse();
  const gather = response.gather({
    input: ["speech", "dtmf"],
    action: leadId ? `/api/voice/continue?leadId=${leadId}` : "/api/voice/continue",
    method: "POST",
    speechTimeout: "auto"
  });
  gather.say(
    {
      voice: "Polly.Aditi",
      language: "en-IN"
    },
    "I can schedule the session at a time that works best for you, and our mentor will customise the plan based on your child's strengths. Should I go ahead and book the free demo?"
  );

  response.redirect({ method: "POST" }, leadId ? `/api/voice/continue?leadId=${leadId}` : "/api/voice/continue");

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" }
  });
}
