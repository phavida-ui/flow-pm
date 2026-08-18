export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 -mx-8 mb-6 flex items-center justify-between gap-5 border-b border-line bg-bg/95 px-8 py-6 backdrop-blur max-[800px]:-mx-4 max-[800px]:px-4">
      <div>
        {eyebrow && <div className="text-[10px] font-extrabold tracking-wide text-[#98a3b3]">{eyebrow}</div>}
        <h1 className="mt-1.5 text-[27px] font-extrabold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </header>
  );
}
