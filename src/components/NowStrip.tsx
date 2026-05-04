type NowItem = { label: string; text: string };

const items: NowItem[] = [
  { label: 'Working', text: 'ABConvert SWE Intern' },
  { label: 'Reading', text: '《Nexus》哈拉瑞' },
  { label: 'Shooting', text: 'Nikon F100 + AI 50mm f/1.4' },
];

export function NowStrip({ updatedAt = '2026.05.04' }: { updatedAt?: string }) {
  return (
    <section className="bg-muted border-l-4 border-foreground p-8 md:p-10">
      <div className="flex items-baseline justify-between mb-6">
        <div className="flex items-baseline gap-3.5">
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-foreground">/ NOW</span>
          <span className="font-serif-tc italic text-sm text-foreground/60">— 2026 年 5 月</span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.12em] text-foreground/55">UPDATED {updatedAt}</span>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {items.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col gap-2 pt-4 border-t border-foreground">
            <span className="font-mono text-[10px] tracking-[0.16em] text-foreground uppercase">{item.label}</span>
            <p className="font-serif-tc text-[15px] leading-relaxed text-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
