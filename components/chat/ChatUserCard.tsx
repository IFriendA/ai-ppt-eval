"use client";

import MessageAnnotationWrapper from "@/components/annotation/MessageAnnotationWrapper";
import { formatTime } from "@/lib/chatHistory";
import type { EvalChatMessage } from "@/lib/chatHistory";

type UserMessage = Extract<EvalChatMessage, { type: "user" }>;

export default function ChatUserCard({ message }: { message: UserMessage }) {
  const content = message.content.trim();

  if (!content) {
    return null;
  }

  const card = (
    <div className="rounded-xl bg-light-gray px-4 py-3">
      <div className="whitespace-pre-wrap wrap-break-word text-start text-sm leading-6 text-default">
        {content}
      </div>
    </div>
  );

  return (
    <div className="group/card relative ms-auto w-fit max-w-[80%] hover:z-10">
      {message.chat_msg_id ? (
        <MessageAnnotationWrapper chatMsgId={message.chat_msg_id}>
          {card}
        </MessageAnnotationWrapper>
      ) : (
        card
      )}
      {message.chat_msg_time ? (
        <div className="absolute bottom-0 end-0 flex h-7 translate-y-full items-center justify-end opacity-0 transition-opacity group-hover/card:opacity-100">
          <span className="text-xs font-medium whitespace-nowrap text-mute">
            {formatTime(message.chat_msg_time)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
