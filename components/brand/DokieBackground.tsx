export default function DokieBackground({
  variant = "login",
}: {
  variant?: "login" | "workspace";
}) {
  if (variant === "workspace") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-blue-3">
        <div
          className="absolute inset-x-0 top-0 h-48"
          style={{
            background:
              "linear-gradient(180deg, rgba(69, 190, 255, 0.35) 0%, rgba(159, 223, 255, 0.12) 55%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-white">
      <div
        className="absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "linear-gradient(180deg, #45BEFF 0%, #9FDFFF 48.56%, #FFFCE3 100%)",
          maskImage:
            "linear-gradient(to top, transparent 0%, #000000 24%, #000000 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "linear-gradient(to top, rgba(255, 252, 227, 0.8), transparent)",
        }}
      />
    </div>
  );
}
