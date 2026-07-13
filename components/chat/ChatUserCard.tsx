"use client";

import { formatTime } from "@/lib/chatHistory";
import type { EvalChatMessage } from "@/lib/chatHistory";

type UserMessage = Extract<EvalChatMessage, { type: "user" }>;

export default function ChatUserCard({ message }: { message: UserMessage }) {
  const content = message.content.trim();

  if (!content) {
    return null;
  }

  return (
    <div className="group/card relative ms-auto w-fit max-w-[80%] pe-6 hover:z-10">
      <div className="rounded-xl bg-light-gray px-4 py-3">
        <div className="whitespace-pre-wrap wrap-break-word text-start text-sm leading-6 text-default">
          {content}
        </div>
      </div>
      {message.chat_msg_time ? (
        <div className="absolute bottom-0 end-6 flex h-7 translate-y-full items-center justify-end pe-2 opacity-0 transition-opacity group-hover/card:opacity-100">
          <span className="text-xs font-medium whitespace-nowrap text-mute">
            {formatTime(message.chat_msg_time)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
