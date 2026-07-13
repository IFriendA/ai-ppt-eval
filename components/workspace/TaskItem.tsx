"use client";

import type { ReactNode } from "react";

type TaskItemProps = {
  label: ReactNode;
  leading: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  indent?: boolean;
  onClick: () => void;
};

export default function TaskItem({
  label,
  leading,
  trailing,
  active = false,
  indent = false,
  onClick,
}: TaskItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start transition",
        indent ? "ps-6" : "",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {leading}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm leading-5">{label}</span>
      {trailing ? (
        <span className="shrink-0 text-xs opacity-80">{trailing}</span>
      ) : null}
    </button>
  );
}
