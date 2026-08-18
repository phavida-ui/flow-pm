const PALETTE = [
  { bg: "#e9f5fe", fg: "#287eb9" },
  { bg: "#f1edff", fg: "#6657c6" },
  { bg: "#fff0ea", fg: "#bd6636" },
  { bg: "#eaf8f1", fg: "#2c865d" },
  { bg: "#fff5df", fg: "#a56e16" },
  { bg: "#f0f2f5", fg: "#667386" },
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const { bg, fg } = colorFor(name);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="grid flex-none place-items-center rounded-full text-[11px] font-extrabold"
      style={{ width: size, height: size, background: bg, color: fg }}
    >
      {initial}
    </div>
  );
}
