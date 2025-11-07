interface MetricsBarProps {
  metrics: {
    total: number;
    demoScheduled: number;
    enrolled: number;
    conversionRate: number;
  };
}

const cards: Array<{
  key: keyof MetricsBarProps["metrics"];
  label: string;
  description: string;
}> = [
  { key: "total", label: "Total Leads", description: "All sources combined" },
  { key: "demoScheduled", label: "Demo Scheduled", description: "Hot prospects ready to convert" },
  { key: "enrolled", label: "Enrolled", description: "Students who joined the academy" },
  { key: "conversionRate", label: "Conversion %", description: "Enrolled vs total leads" }
];

export default function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.key} className="rounded-2xl border border-white/5 bg-white/10 p-6 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-brand-200">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {card.key === "conversionRate" ? `${metrics[card.key]}%` : metrics[card.key]}
          </p>
          <p className="mt-2 text-sm text-slate-200">{card.description}</p>
        </article>
      ))}
    </section>
  );
}
