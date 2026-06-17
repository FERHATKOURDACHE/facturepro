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
    <article className="card rounded-[1.6rem] p-6">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </article>
  );
}
