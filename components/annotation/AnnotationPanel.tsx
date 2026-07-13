"use client";

import { useState } from "react";
import {
  ANNOTATION_SEVERITIES,
  type AnnotationSeverity,
  type MessageAnnotation,
} from "@/lib/annotation/types";

type AnnotationPanelProps = {
  annotation?: MessageAnnotation;
  onSave: (input: {
    note: string;
    severity: AnnotationSeverity;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
};

function getSeverityOptionClassName(
  value: AnnotationSeverity,
  selected: boolean,
) {
  if (!selected) {
    return "border-zinc-200 bg-white text-mute hover:border-zinc-300 hover:text-default";
  }

  if (value === 3) {
    return "border-red-300 bg-red-50 text-red-700";
  }
  if (value === 2) {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }
  return "border-blue bg-blue-soft text-blue";
}

export default function AnnotationPanel({
  annotation,
  onSave,
  onDelete,
  onClose,
}: AnnotationPanelProps) {
  const [severity, setSeverity] = useState<AnnotationSeverity>(
    annotation?.severity ?? 2,
  );
  const [note, setNote] = useState(annotation?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;

    setSaving(true);
    try {
      await onSave({
        note: note.trim(),
        severity,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="font-['Figtree'] text-sm font-medium leading-5 text-default">
          {annotation ? "编辑标注" : "添加标注"}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-mute transition hover:bg-light-gray hover:text-default"
          aria-label="关闭"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 3L11 11M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4 px-4 py-4">
        <fieldset>
          <legend className="mb-2 font-['Figtree'] text-xs font-medium leading-4 text-mute">
            严重程度
          </legend>
          <div className="flex gap-2">
            {ANNOTATION_SEVERITIES.map((item) => {
              const selected = severity === item.value;

              return (
                <label
                  key={item.value}
                  className={[
                    "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition",
                    "font-['Figtree'] text-xs font-medium leading-4",
                    getSeverityOptionClassName(item.value, selected),
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="annotation-severity"
                    value={item.value}
                    checked={selected}
                    onChange={() => setSeverity(item.value)}
                    className="sr-only"
                  />
                  <span
                    className={[
                      "size-2 rounded-full",
                      selected
                        ? item.value === 3
                          ? "bg-red-500"
                          : item.value === 2
                            ? "bg-amber-500"
                            : "bg-blue"
                        : "bg-zinc-300",
                    ].join(" ")}
                  />
                  {item.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block font-['Figtree'] text-xs font-medium leading-4 text-mute">
            备注
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            autoFocus
            placeholder="描述问题..."
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-['Figtree'] text-sm font-normal leading-5 text-default outline-none transition placeholder:text-mute focus:border-blue"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-3">
        {annotation && onDelete ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting || saving}
            className="cursor-pointer rounded-lg px-2.5 py-1.5 font-['Figtree'] text-xs font-medium leading-4 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "删除中..." : "删除"}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || deleting || !note.trim()}
          className="cursor-pointer rounded-lg bg-blue px-4 py-1.5 font-['Figtree'] text-xs font-medium leading-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
