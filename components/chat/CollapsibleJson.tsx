"use client";

export function formatJson(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

export function hasPayload(value: unknown) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function getPreview(value: unknown) {
  const formatted = formatJson(value).replace(/\s+/g, " ").trim();
  if (!formatted) return "";
  return formatted.length > 72 ? `${formatted.slice(0, 72)}…` : formatted;
}

export default function CollapsibleJson({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  if (!hasPayload(value)) return null;

  const preview = getPreview(value);

  return (
    <details className="group rounded-lg border border-zinc-200 bg-white">
      <summary className="cursor-pointer list-none px-3 py-2 marker:content-none">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-zinc-400 transition group-open:rotate-90">
            ▸
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-default">{label}</div>
            <div className="mt-0.5 truncate text-[11px] leading-4 text-mute group-open:hidden">
              {preview}
            </div>
          </div>
        </div>
      </summary>
      <pre className="overflow-x-auto border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] leading-5 text-default">
        {formatJson(value)}
      </pre>
    </details>
  );
}
