export function BrandStripeDivider({ className }: { className?: string }) {
  const stripes = [
    { color: "#FFC928", flex: 3 },
    { color: "#FF663F", flex: 2 },
    { color: "#F12F43", flex: 2 },
    { color: "#D91D71", flex: 2 },
    { color: "#76116D", flex: 1 },
  ];

  return (
    <div className={`flex w-full h-3 ${className ?? ""}`} aria-hidden="true">
      {stripes.map((s, i) => (
        <div key={i} style={{ backgroundColor: s.color, flex: s.flex }} />
      ))}
    </div>
  );
}
