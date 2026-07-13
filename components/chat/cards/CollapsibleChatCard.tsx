"use client";

import { useState, type ReactNode } from "react";

export default function CollapsibleChatCard({
  icon,
  title,
  summary,
  children,
  defaultOpen = false,
  headerClassName,
}: {
  icon: ReactNode;
  title: string;
  summary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  headerClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          "flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-start transition hover:bg-light-gray",
          headerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-light-gray">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-default">
            {title}
          </span>
          {summary && !open ? (
            <span className="mt-0.5 block truncate text-xs text-mute">
              {summary}
            </span>
          ) : null}
        </span>
        <span
          className={[
            "shrink-0 text-xs text-mute transition-transform",
            open ? "rotate-90" : "",
          ].join(" ")}
        >
          ▸
        </span>
      </button>
      {open ? (
        <div className="border-t border-zinc-100 bg-zinc-50/80 px-3 py-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  if (value === undefined || value === null || value === "") return null;

  const text =
    typeof value === "boolean" ? (value ? "是" : "否") : String(value);

  return (
    <div className="text-sm leading-6">
      <span className="font-medium text-default">{label}：</span>
      <span className="text-mute">{text}</span>
    </div>
  );
}

export function CardInfoRows({
  rows,
}: {
  rows: Array<{ label: string; value?: string | number | boolean | null }>;
}) {
  const visible = rows.filter(
    (row) =>
      row.value !== undefined && row.value !== null && row.value !== "",
  );

  if (visible.length === 0) {
    return (
      <div className="text-xs text-mute">暂无内容</div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {visible.map((row) => (
        <InfoRow key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  );
}
