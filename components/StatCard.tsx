export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <article className="card group rounded-[1.7rem] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="h-3 w-3 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(11,122,59,0.10)] transition group-hover:scale-125" />
      </div>

      {helper && (
        <p className="mt-3 text-sm leading-6 text-slate-500">{helper}</p>
      )}
    </article>
  );
}
