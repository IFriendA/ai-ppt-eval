"use client";

import { useMemo, useState } from "react";
import AnnotationPanel from "@/components/annotation/AnnotationPanel";
import { useAnnotation } from "@/components/annotation/AnnotationProvider";
import {
  getSeverityLabel,
  type AnnotationSeverity,
} from "@/lib/annotation/types";

function getSeverityOverlayClassName(severity: AnnotationSeverity) {
  if (severity === 3) {
    return "border-red-400 bg-red-500/10";
  }
  if (severity === 2) {
    return "border-amber-400 bg-amber-500/10";
  }
  return "border-blue bg-blue/10";
}

function getBadgeClassName(severity: AnnotationSeverity) {
  if (severity === 3) {
    return "bg-red-500";
  }
  if (severity === 2) {
    return "bg-amber-500";
  }
  return "bg-blue";
}

export default function MessageAnnotationWrapper({
  chatMsgId,
  children,
}: {
  chatMsgId: number;
  children: React.ReactNode;
}) {
  const { getAnnotation, upsertAnnotation, removeAnnotation } = useAnnotation();
  const annotation = getAnnotation(chatMsgId);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hovering, setHovering] = useState(false);

  const preview = useMemo(() => {
    if (!annotation?.note) return "";
    const text = annotation.note.replace(/\s+/g, " ").trim();
    return text.length > 100 ? `${text.slice(0, 100)}…` : text;
  }, [annotation?.note]);

  const handleSave = async (input: {
    note: string;
    severity: AnnotationSeverity;
  }) => {
    await upsertAnnotation({
      chatMsgId,
      note: input.note,
      severity: input.severity,
      id: annotation?.id,
    });
  };

  const handleDelete = async () => {
    await removeAnnotation(chatMsgId);
  };

  return (
    <div
      className="group/annotation flex items-stretch gap-2"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={[
          "relative min-w-0 flex-1 rounded-lg",
          panelOpen ? "z-20" : "",
          !annotation && hovering && !panelOpen
            ? "ring-1 ring-inset ring-blue"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative">{children}</div>

        {annotation ? (
          <div
            className={[
              "pointer-events-none absolute inset-0 z-[1] rounded-lg border-2",
              getSeverityOverlayClassName(annotation.severity),
            ].join(" ")}
          />
        ) : null}

        {hovering && !panelOpen ? (
          <div
            className={[
              "pointer-events-none absolute inset-0 z-[2] rounded-lg",
              annotation ? "bg-white/25" : "bg-blue-soft/70",
            ].join(" ")}
          />
        ) : null}
      </div>

      <div className="relative flex shrink-0 items-center">
        {annotation ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 shadow-sm"
              title={annotation.note}
            >
              <span
                className={[
                  "size-2 rounded-full",
                  getBadgeClassName(annotation.severity),
                ].join(" ")}
              />
              <span className="max-w-[72px] truncate text-[10px] font-medium text-default">
                {getSeverityLabel(annotation.severity)}
              </span>
            </button>

            {preview ? (
              <div
                className={[
                  "pointer-events-none absolute end-full top-1/2 z-20 me-2 w-80 max-w-[min(20rem,calc(100vw-2rem))] -translate-y-1/2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs leading-5 text-default shadow-md transition-opacity",
                  hovering && !panelOpen ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                {preview}
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className={[
              "cursor-pointer rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium shadow-sm transition-opacity",
              hovering && !panelOpen
                ? "pointer-events-auto border-blue text-blue opacity-100"
                : "pointer-events-none text-mute opacity-0",
            ].join(" ")}
          >
            标注
          </button>
        )}

        {panelOpen ? (
          <>
            <div
              className="fixed inset-0 z-[15] cursor-default"
              onMouseDown={() => setPanelOpen(false)}
              aria-hidden
            />
            <div className="absolute end-full top-1/2 z-20 me-2 w-80 max-w-[min(20rem,calc(100vw-2rem))] -translate-y-1/2">
              <AnnotationPanel
                annotation={annotation}
                onSave={handleSave}
                onDelete={annotation ? handleDelete : undefined}
                onClose={() => setPanelOpen(false)}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
