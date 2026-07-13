"use client";

import { useEffect, useRef } from "react";
import ChatSystemCard from "@/components/chat/ChatSystemCard";
import ChatUserCard from "@/components/chat/ChatUserCard";
import type { ProjectFormat } from "@/api/types";
import type { EvalChatMessage } from "@/lib/chatHistory";

type ChatHistoryPanelProps = {
  projectId: number;
  messages: EvalChatMessage[];
  loading: boolean;
  error: string | null;
  projectFormat?: ProjectFormat | null;
};

export default function ChatHistoryPanel({
  projectId,
  messages,
  loading,
  error,
  projectFormat = "main_agent",
}: ChatHistoryPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        加载历史消息...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        暂无历史消息
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" data-project-id={projectId}>
      <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-6 py-6 pe-10">
        {messages.map((message) =>
          message.type === "user" ? (
            <ChatUserCard key={message.id} message={message} />
          ) : (
            <ChatSystemCard
              key={message.id}
              message={message}
              projectFormat={projectFormat}
            />
          ),
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
