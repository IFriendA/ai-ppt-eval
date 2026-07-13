"use client";

import Image from "next/image";
import MessageAnnotationWrapper from "@/components/annotation/MessageAnnotationWrapper";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import ToolCallCard from "@/components/chat/ToolCallCard";
import KeyInfosCard from "@/components/chat/cards/KeyInfosCard";
import NewVersionCard from "@/components/chat/cards/NewVersionCard";
import NpsCard from "@/components/chat/cards/NpsCard";
import OutlineCard from "@/components/chat/cards/OutlineCard";
import OutlineConfirmCard from "@/components/chat/cards/OutlineConfirmCard";
import OutlineNewCard from "@/components/chat/cards/OutlineNewCard";
import { formatTime, type SystemItem } from "@/lib/chatHistory";
import type { ProjectFormat } from "@/api/types";
import { getAgentLabel } from "@/lib/taskUtil";
import type { EvalChatMessage } from "@/lib/chatHistory";

type SystemMessage = Extract<EvalChatMessage, { type: "system" }>;

function AnnotatedItem({
  item,
  children,
}: {
  item: SystemItem;
  children: React.ReactNode;
}) {
  if (!item.chat_msg_id) {
    return <>{children}</>;
  }

  return (
    <MessageAnnotationWrapper chatMsgId={item.chat_msg_id}>
      {children}
    </MessageAnnotationWrapper>
  );
}

function renderSystemItem(item: SystemItem) {
  if (item.kind === "thought") {
    return (
      <div className="rounded-lg border border-blue-4 bg-blue-3 px-3 py-2 text-xs leading-5 text-blue-11">
        <div className="mb-1 font-medium text-blue">思考</div>
        <ChatMarkdown content={item.content} className="text-xs" />
      </div>
    );
  }

  if (item.kind === "text") {
    return <ChatMarkdown content={item.content} />;
  }

  if (item.kind === "tool") {
    return <ToolCallCard tool={item.tool} />;
  }

  if (item.kind === "key_infos") {
    return <KeyInfosCard data={item.data} />;
  }

  if (item.kind === "outline") {
    return <OutlineCard data={item.data} />;
  }

  if (item.kind === "outline_new") {
    return <OutlineNewCard data={item.data} />;
  }

  if (item.kind === "outline_confirm") {
    return <OutlineConfirmCard />;
  }

  if (item.kind === "new_ver") {
    return <NewVersionCard data={item.data} />;
  }

  if (item.kind === "nps") {
    return <NpsCard />;
  }

  if (item.kind === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {item.content}
      </div>
    );
  }

  return null;
}

export default function ChatSystemCard({
  message,
  projectFormat = "main_agent",
}: {
  message: SystemMessage;
  projectFormat?: ProjectFormat | null;
}) {
  const agentLabel = getAgentLabel(projectFormat);

  return (
    <div className="group/card relative w-full self-start px-6 hover:z-10">
      <div className="flex items-center gap-2 pb-1 pt-3">
        <Image
          src="/logo.svg"
          alt="Dokie"
          width={24}
          height={24}
          unoptimized
          className="size-6 shrink-0"
        />
        <span className="font-['Figtree'] text-sm font-normal leading-5 text-mute">
          {agentLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 py-1 text-start">
        {message.items.map((item) => {
          const content = renderSystemItem(item);
          if (!content) return null;

          return (
            <AnnotatedItem key={item.id} item={item}>
              {content}
            </AnnotatedItem>
          );
        })}
      </div>

      {message.chat_msg_time ? (
        <div className="flex h-7 items-center opacity-0 transition-opacity group-hover/card:opacity-100">
          <span className="text-xs font-medium text-mute">
            {formatTime(message.chat_msg_time)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
