export const LeadStatusList = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "DEMO_SCHEDULED",
  "DEMO_COMPLETED",
  "ENROLLED",
  "LOST"
] as const;
export type LeadStatus = (typeof LeadStatusList)[number];

export const LeadSourceList = [
  "FACEBOOK",
  "GOOGLE_ADS",
  "INBOUND_CALL",
  "WEBSITE_FORM",
  "IMPORTED",
  "MANUAL"
] as const;
export type LeadSource = (typeof LeadSourceList)[number];

export const TargetExamList = [
  "SAINIK_SCHOOL",
  "RASHTRIYA_MILITARY_SCHOOL",
  "NAVODAYA",
  "OTHER"
] as const;
export type TargetExam = (typeof TargetExamList)[number];

export interface CallRecord {
  id: string;
  leadId: string;
  direction: "INBOUND" | "OUTBOUND";
  recordingUrl?: string | null;
  transcript?: string | null;
  disposition: "PENDING" | "COMPLETED" | "FAILED" | "NO_ANSWER";
  outcomeNotes?: string | null;
  startedAt: string | Date;
  endedAt?: string | Date | null;
}

export interface Lead {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  studentName?: string | null;
  studentClass?: string | null;
  targetExam: TargetExam;
  source: LeadSource;
  sourceLeadId?: string | null;
  status: LeadStatus;
  tags: string[];
  notes?: string | null;
  lastContactedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LeadWithCalls extends Lead {
  calls: CallRecord[];
}

export interface AgentScriptType {
  id: string;
  name: string;
  persona: string;
  greeting: string;
  pitch: string;
  objectionHandling: string;
  closing: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
