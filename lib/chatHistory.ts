import type { HistoryMessage } from "@/api/types";

export type ChatDisplayMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  time?: number;
};

export function parseHistoryMessages(
  messages: HistoryMessage[],
): ChatDisplayMessage[] {
  const result: ChatDisplayMessage[] = [];
  const seen = new Set<string>();

  [...messages].reverse().forEach((item, index) => {
    const chatMsgId = item.chat_msg_id ?? index;

    if (item.user_msg?.msg?.trim()) {
      const key = `user-${chatMsgId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: key,
          role: "user",
          content: item.user_msg.msg.trim(),
          time: item.chat_msg_time,
        });
      }
    }

    if (item.msg_type === "chat.text" && item.text_streaming_msg?.trim()) {
      const key = `assistant-text-${chatMsgId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: key,
          role: "assistant",
          content: item.text_streaming_msg.trim(),
          time: item.chat_msg_time,
        });
      }
    }

    if (item.msg_type === "chat.tools") {
      result.push({
        id: `tool-${chatMsgId}-${item.tool_name ?? index}`,
        role: "system",
        content: `工具：${item.tool_desc || item.tool_name || "执行中"}`,
        time: item.chat_msg_time,
      });
    }

    if (item.msg_type === "error" && item.msg) {
      result.push({
        id: `error-${chatMsgId}`,
        role: "system",
        content: item.msg,
        time: item.chat_msg_time,
      });
    }
  });

  return result;
}

function formatTime(timestamp?: number) {
  if (!timestamp) return "";

  return new Date(timestamp * 1000).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { formatTime };
