"use client";

import { useState } from "react";
import { hasPayload, formatJson } from "@/components/chat/CollapsibleJson";
import {
  getToolDisplayInfo,
  getToolDisplayLabel,
  isHiddenTool,
} from "@/lib/toolDisplay";
import type { ToolCallDisplay } from "@/lib/chatHistory";

type PayloadPanel = "definition" | "input" | "output" | null;

function PayloadToggle({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (disabled) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium leading-4 transition",
        active
          ? "bg-blue text-white"
          : "border border-zinc-200 bg-white text-mute hover:border-blue hover:text-blue",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ToolDot({ colorClass }: { colorClass: string }) {
  return (
    <span
      className={["size-2 shrink-0 rounded-full bg-current", colorClass].join(
        " "
      )}
    />
  );
}

function ToolInvocationRow({
  tool,
  showPayload,
}: {
  tool: ToolCallDisplay;
  showPayload?: boolean;
}) {
  const [activePanel, setActivePanel] = useState<PayloadPanel>(null);
  const hasDefinition = hasPayload(tool.definition);
  const hasInput = hasPayload(tool.input);
  const hasOutput = hasPayload(tool.output);
  const displayInfo = getToolDisplayInfo(tool.tool_name);
  const label = getToolDisplayLabel(tool);

  const togglePanel = (panel: Exclude<PayloadPanel, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className="min-w-0">
      <div className="flex h-7 items-center gap-2 overflow-hidden rounded-lg border border-zinc-200 bg-white px-2">
        <ToolDot colorClass={displayInfo?.colorClass ?? "text-blue"} />
        <span className="shrink-0 text-xs font-medium text-default">
          {label}
        </span>
        {tool.tool_desc ? (
          <span
            className="min-w-0 flex-1 truncate text-xs text-mute"
            title={tool.tool_desc}
          >
            {tool.tool_desc}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        {showPayload ? (
          <div className="flex shrink-0 items-center gap-1">
            <PayloadToggle
              label="工具描述"
              active={activePanel === "definition"}
              disabled={!hasDefinition}
              onClick={() => togglePanel("definition")}
            />
            <PayloadToggle
              label="入参"
              active={activePanel === "input"}
              disabled={!hasInput}
              onClick={() => togglePanel("input")}
            />
            <PayloadToggle
              label="出参"
              active={activePanel === "output"}
              disabled={!hasOutput}
              onClick={() => togglePanel("output")}
            />
          </div>
        ) : null}
      </div>

      {activePanel === "definition" && hasDefinition ? (
        <pre className="mt-1 max-h-48 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-[10px] leading-4 whitespace-pre-wrap text-default">
          {formatJson(tool.definition)}
        </pre>
      ) : null}

      {activePanel === "input" && hasInput ? (
        <pre className="mt-1 max-h-48 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-[10px] leading-4 text-default">
          {formatJson(tool.input)}
        </pre>
      ) : null}

      {activePanel === "output" && hasOutput ? (
        <pre className="mt-1 max-h-48 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-[10px] leading-4 text-default">
          {formatJson(tool.output)}
        </pre>
      ) : null}
    </div>
  );
}

export default function ToolCallCard({
  tool,
}: {
  tool: ToolCallDisplay;
  index?: number;
}) {
  if (isHiddenTool(tool.tool_name)) {
    return null;
  }

  const invocations =
    tool.toolList && tool.toolList.length > 0 ? tool.toolList : [tool];
  const displayInfo = getToolDisplayInfo(tool.tool_name);
  const label = getToolDisplayLabel(tool);
  const multiTool = invocations.length > 1;

  if (!multiTool) {
    return (
      <div className="w-full max-w-full self-start">
        <ToolInvocationRow tool={invocations[0]} showPayload />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-1 self-start">
      <div className="flex h-7 items-center gap-2 overflow-hidden rounded-lg border border-zinc-200 bg-white px-2">
        <ToolDot colorClass={displayInfo?.colorClass ?? "text-blue"} />
        <span className="shrink-0 text-xs font-medium text-default">
          {label}
        </span>
        <span className="text-xs text-mute">· {invocations.length} 次</span>
      </div>
      <div className="flex gap-2 ps-1">
        <div className="w-3 shrink-0 border-s border-zinc-200" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {invocations.map((invocation, invocationIndex) => (
            <ToolInvocationRow
              key={`${invocation.tool_name}-${invocationIndex}`}
              tool={invocation}
              showPayload
            />
          ))}
        </div>
      </div>
    </div>
  );
}
