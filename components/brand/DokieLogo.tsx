import Image from "next/image";

type DokieLogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
};

const sizeMap = {
  sm: 28,
  md: 40,
  lg: 64,
} as const;

export default function DokieLogo({
  size = "md",
  showWordmark = true,
  subtitle,
  className = "",
}: DokieLogoProps) {
  const iconSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Dokie"
        width={iconSize}
        height={iconSize}
        unoptimized
        className="shrink-0"
      />
      {showWordmark ? (
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-['Figtree'] text-lg font-semibold leading-6 text-default">
              Dokie
            </span>
            {subtitle ? (
              <span className="rounded-md bg-blue-soft px-1.5 py-0.5 text-[10px] font-medium leading-4 text-blue">
                {subtitle}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
