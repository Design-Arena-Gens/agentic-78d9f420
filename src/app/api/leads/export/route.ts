import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const { prisma } = await import("@/lib/prisma");
  const leads = await prisma.lead.findMany({
    include: {
      calls: {
        orderBy: { startedAt: "desc" },
        take: 3
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");
  sheet.columns = [
    { header: "Full Name", key: "fullName", width: 25 },
    { header: "Phone Number", key: "phoneNumber", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Student Name", key: "studentName", width: 20 },
    { header: "Class", key: "studentClass", width: 12 },
    { header: "Target Exam", key: "targetExam", width: 22 },
    { header: "Source", key: "source", width: 18 },
    { header: "Status", key: "status", width: 18 },
    { header: "Tags", key: "tags", width: 30 },
    { header: "Notes", key: "notes", width: 40 },
    { header: "Last Contacted", key: "lastContactedAt", width: 20 },
    { header: "Created At", key: "createdAt", width: 20 }
  ];

  leads.forEach((lead) => {
    sheet.addRow({
      ...lead,
      tags: lead.tags.join(", "),
      createdAt: lead.createdAt.toISOString(),
      lastContactedAt: lead.lastContactedAt?.toISOString() ?? "",
      notes: lead.notes ?? ""
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="victory-cadets-leads.xlsx"`
    }
  });
}
