"use client";

import { useEffect, useRef } from "react";
import type { ChatDisplayMessage } from "@/lib/chatHistory";
import { formatTime } from "@/lib/chatHistory";

type ChatHistoryPanelProps = {
  messages: ChatDisplayMessage[];
  loading: boolean;
  error: string | null;
};

function MessageBubble({ message }: { message: ChatDisplayMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-zinc-900 px-4 py-3 text-sm leading-6 text-white">
          <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
          {message.time ? (
            <div className="mt-2 text-end text-xs text-zinc-300">
              {formatTime(message.time)}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-800">
          <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
          {message.time ? (
            <div className="mt-2 text-xs text-zinc-400">
              {formatTime(message.time)}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
        {message.content}
      </div>
    </div>
  );
}

export default function ChatHistoryPanel({
  messages,
  loading,
  error,
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
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
