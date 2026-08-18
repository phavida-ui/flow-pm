export function Panel({
  title,
  subtitle,
  children,
  empty,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[17px] border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-[17px]">
        <div>
          <h3 className="text-sm font-extrabold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[10px] text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className={empty ? "p-8 text-center text-xs text-muted" : "px-3 py-2"}>{children}</div>
    </section>
  );
}
