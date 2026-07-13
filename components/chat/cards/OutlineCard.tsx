"use client";

import type { OutlineData } from "@/api/chatMessageTypes";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import CollapsibleChatCard from "./CollapsibleChatCard";

function buildOutlineMarkdown(items: OutlineData["outline"]) {
  return (items ?? [])
    .map((item) => item.content?.trim())
    .filter(Boolean)
    .join("\n\n");
}

export default function OutlineCard({ data }: { data: OutlineData }) {
  const items = data.outline ?? [];
  const markdown = buildOutlineMarkdown(items);
  const summary =
    items[0]?.content?.replace(/^#+\s*/gm, "").replace(/\n+/g, " ").trim().slice(0, 48) ||
    (items.length > 0 ? `${items.length} 页大纲` : "大纲");

  return (
    <CollapsibleChatCard
      icon={<span className="text-sm">🌲</span>}
      title="大纲"
      summary={
        items.length > 0
          ? `${summary}${summary.length >= 48 ? "…" : ""}`
          : summary
      }
    >
      {markdown ? (
        <ChatMarkdown content={markdown} className="text-sm" />
      ) : (
        <div className="text-xs text-mute">暂无大纲内容</div>
      )}
    </CollapsibleChatCard>
  );
}
