"use client";

import type { NewVerData } from "@/api/chatMessageTypes";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import CollapsibleChatCard from "./CollapsibleChatCard";

export default function NewVersionCard({ data }: { data: NewVerData }) {
  const title = [data.ver_str, data.ver_desc].filter(Boolean).join(" · ") || "新版本";
  const summary = data.ver_streaming_msg?.replace(/\n/g, " ").trim().slice(0, 56);

  return (
    <CollapsibleChatCard
      icon={<span className="text-sm">🚩</span>}
      title={title}
      summary={summary ? `${summary}${summary.length >= 56 ? "…" : ""}` : undefined}
      headerClassName="bg-green-50/80"
    >
      <div className="flex flex-col gap-2">
        {data.ver_id != null ? (
          <div className="text-xs text-mute">版本 ID：{data.ver_id}</div>
        ) : null}
        {data.ver_create_time ? (
          <div className="text-xs text-mute">
            创建时间：
            {new Date(data.ver_create_time * 1000).toLocaleString("zh-CN")}
          </div>
        ) : null}
        {data.ver_streaming_msg ? (
          <ChatMarkdown content={data.ver_streaming_msg} className="text-sm" />
        ) : (
          <div className="text-xs text-mute">暂无版本说明</div>
        )}
      </div>
    </CollapsibleChatCard>
  );
}
