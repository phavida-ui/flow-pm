import { clsx } from "clsx";

export function StatCard({ label, value, tone }: { label: string; value: number; tone?: "danger" }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <span className="text-[10px] font-bold text-muted">{label}</span>
      <div className={clsx("mt-1.5 text-[22px] font-extrabold", tone === "danger" && value > 0 && "text-red")}>
        {value}
      </div>
    </div>
  );
}
