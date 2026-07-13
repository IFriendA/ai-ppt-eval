"use client";

import type { OutlineNewData } from "@/api/chatMessageTypes";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import CollapsibleChatCard from "./CollapsibleChatCard";

export default function OutlineNewCard({ data }: { data: OutlineNewData }) {
  const outline = data.outline?.trim() ?? "";
  const summary = outline
    .replace(/^#+\s*/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 56);

  return (
    <CollapsibleChatCard
      icon={<span className="text-sm">📝</span>}
      title="新大纲"
      summary={summary ? `${summary}${summary.length >= 56 ? "…" : ""}` : "待生成"}
    >
      {outline ? (
        <ChatMarkdown content={outline} className="text-sm" />
      ) : (
        <div className="text-xs text-mute">暂无大纲内容</div>
      )}
    </CollapsibleChatCard>
  );
}
