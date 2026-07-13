"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  filterModelGroups,
  getModelProviderMeta,
  groupPinovaModels,
} from "@/lib/pinovaModelMeta";
import { PINOVA_MODELS } from "@/lib/pinovaModels";

type ModelSelectorProps = {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`size-4 shrink-0 text-mute transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className="size-4 shrink-0 text-mute"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className="size-4 shrink-0 text-blue"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414l2.543 2.543 6.543-6.543a1 1 0 0 1 1.412-.003Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ProviderBadge({
  label,
  badgeClass,
}: {
  label: string;
  badgeClass: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${badgeClass}`}
    >
      {label}
    </span>
  );
}

export default function ModelSelector({
  value,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupPinovaModels(PINOVA_MODELS), []);
  const filteredGroups = useMemo(
    () => filterModelGroups(groups, query),
    [groups, query],
  );
  const selectedMeta = getModelProviderMeta(value);
  const resultCount = filteredGroups.reduce(
    (count, group) => count + group.models.length,
    0,
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  const handleSelect = (model: string) => {
    onChange(model);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white px-3.5 py-3 text-start shadow-sm transition hover:border-blue/40 hover:shadow-md focus-visible:border-blue focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-mute">
              当前模型
            </span>
            <ProviderBadge
              label={selectedMeta.label}
              badgeClass={selectedMeta.badgeClass}
            />
          </div>
          <span className="truncate font-mono text-sm font-medium leading-5 text-default">
            {value}
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl">
          <div className="border-b border-zinc-200/80 bg-light-gray/60 px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2">
              <SearchIcon />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索模型名称..."
                className="min-w-0 flex-1 bg-transparent text-sm text-default outline-none placeholder:text-mute"
              />
            </div>
            <p className="mt-2 px-1 text-[11px] text-mute">
              {resultCount} 个模型可选
            </p>
          </div>

          <div className="max-h-[min(360px,50vh)] overflow-y-auto p-2">
            {filteredGroups.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-mute">
                未找到匹配模型
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.provider} className="mb-1 last:mb-0">
                  <div className="sticky top-0 z-10 flex items-center gap-2 bg-white/95 px-2 py-2 backdrop-blur-sm">
                    <ProviderBadge
                      label={group.label}
                      badgeClass={group.badgeClass}
                    />
                    <span className="text-[11px] text-mute">
                      {group.models.length}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {group.models.map((model) => {
                      const selected = model === value;

                      return (
                        <button
                          key={model}
                          type="button"
                          onClick={() => handleSelect(model)}
                          className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-start transition ${
                            selected
                              ? "bg-blue-soft text-blue"
                              : "text-default hover:bg-light-gray"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate font-mono text-xs leading-5">
                            {model}
                          </span>
                          {selected ? <CheckIcon /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
