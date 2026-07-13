import type { HistoryMessage, MessageUserMsg } from "@/api/types";
import type {
  KeyInfosData,
  NewVerData,
  OutlineData,
  OutlineNewData,
} from "@/api/chatMessageTypes";

export type { HistoryMessage };

export type ToolCallDisplay = {
  tool_name: string;
  tool_desc?: string;
  tool_finish?: boolean;
  tool_ext?: Record<string, unknown>;
  definition?: unknown;
  input?: unknown;
  output?: unknown;
  toolList?: ToolCallDisplay[];
};

export type SystemItem =
  | { kind: "text"; id: string; chat_msg_id: number; content: string }
  | { kind: "thought"; id: string; chat_msg_id: number; content: string }
  | { kind: "tool"; id: string; chat_msg_id: number; tool: ToolCallDisplay }
  | { kind: "error"; id: string; chat_msg_id: number; content: string }
  | { kind: "key_infos"; id: string; chat_msg_id: number; data: KeyInfosData }
  | { kind: "outline"; id: string; chat_msg_id: number; data: OutlineData }
  | { kind: "outline_new"; id: string; chat_msg_id: number; data: OutlineNewData }
  | { kind: "outline_confirm"; id: string; chat_msg_id: number }
  | { kind: "new_ver"; id: string; chat_msg_id: number; data: NewVerData }
  | { kind: "nps"; id: string; chat_msg_id: number };

export type EvalChatMessage =
  | {
      type: "user";
      id: string;
      chat_msg_id: number;
      chat_msg_time?: number;
      content: string;
    }
  | {
      type: "system";
      id: string;
      chat_msg_id: number;
      chat_msg_time?: number;
      items: SystemItem[];
    };

const SYSTEM_MESSAGE_TYPES = new Set([
  "chat.text",
  "chat.new_ver",
  "chat.tools",
  "chat.key_infos",
  "chat.outline",
  "chat.outline.new",
  "chat.outline.confirm",
  "chat.nps.generate",
]);

const HIDDEN_TOOL_NAMES = new Set(["ui_update_tool", "todo_write_tool"]);

function isSystemMessage(message: HistoryMessage) {
  return SYSTEM_MESSAGE_TYPES.has(message.msg_type);
}

function genId(prefix: string, chatMsgId: number, index: number) {
  return `${prefix}-${chatMsgId}-${index}`;
}

function extractToolPayload(message: HistoryMessage) {
  const record = message as Record<string, unknown>;
  const ext = (message.tool_ext ?? {}) as Record<string, unknown>;

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null) {
        return record[key];
      }
      if (ext[key] !== undefined && ext[key] !== null) {
        return ext[key];
      }
    }
    return undefined;
  };

  const input = pick(
    "tool_input",
    "input",
    "tool_args",
    "args",
    "request",
    "params",
  );
  const output = pick(
    "tool_output",
    "output",
    "tool_result",
    "result",
    "response",
    "data",
  );
  const definition = pick("tool_definition", "definition");

  return { input, output, definition };
}

function pickKeyInfosData(message: HistoryMessage): KeyInfosData {
  return {
    key_infos_topic: message.key_infos_topic as string | undefined,
    key_infos_objective: message.key_infos_objective as string | undefined,
    key_infos_scenario: message.key_infos_scenario as string | undefined,
    key_infos_audience: message.key_infos_audience as string | undefined,
    key_infos_page_count: message.key_infos_page_count as number | undefined,
    key_infos_page_num: message.key_infos_page_num as string | undefined,
    key_infos_ratio: message.key_infos_ratio as string | undefined,
    key_infos_theme: message.key_infos_theme as KeyInfosData["key_infos_theme"],
    key_infos_animation: message.key_infos_animation as string | undefined,
    key_infos_language: message.key_infos_language as string | undefined,
    key_infos_enable_web_search: message.key_infos_enable_web_search as
      | boolean
      | undefined,
    key_infos_brand: message.key_infos_brand as KeyInfosData["key_infos_brand"],
  };
}

function pickOutlineData(message: HistoryMessage): OutlineData {
  return {
    outline: message.outline as OutlineData["outline"],
  };
}

function pickOutlineNewData(message: HistoryMessage): OutlineNewData {
  return {
    outline:
      typeof message.outline === "string"
        ? message.outline
        : (message.outline as string | undefined),
  };
}

function pickNewVerData(message: HistoryMessage): NewVerData {
  return {
    ver_id: message.ver_id as number | undefined,
    ver_str: message.ver_str as string | undefined,
    ver_desc: message.ver_desc as string | undefined,
    ver_create_time: message.ver_create_time as number | undefined,
    ver_streaming_msg: message.ver_streaming_msg as string | undefined,
  };
}

function historyItemsFromMessage(
  message: HistoryMessage,
  index: number,
): SystemItem[] {
  const chatMsgId = message.chat_msg_id ?? index;
  const items: SystemItem[] = [];

  if (message.msg_type === "chat.text") {
    if (message.text_streaming_thought?.trim()) {
      items.push({
        kind: "thought",
        id: genId("thought", chatMsgId, index),
        chat_msg_id: chatMsgId,
        content: message.text_streaming_thought.trim(),
      });
    }

    if (message.text_streaming_msg?.trim()) {
      items.push({
        kind: "text",
        id: genId("text", chatMsgId, index),
        chat_msg_id: chatMsgId,
        content: message.text_streaming_msg.trim(),
      });
    }

    return items;
  }

  if (message.msg_type === "chat.tools") {
    if (!message.tool_name || HIDDEN_TOOL_NAMES.has(message.tool_name)) {
      return items;
    }

    const { input, output, definition } = extractToolPayload(message);

    items.push({
      kind: "tool",
      id: genId("tool", chatMsgId, index),
      chat_msg_id: chatMsgId,
      tool: {
        tool_name: message.tool_name,
        tool_desc: message.tool_desc,
        tool_finish: message.tool_finish,
        tool_ext: message.tool_ext,
        definition,
        input,
        output,
      },
    });

    return items;
  }

  if (message.msg_type === "error" && message.msg) {
    items.push({
      kind: "error",
      id: genId("error", chatMsgId, index),
      chat_msg_id: chatMsgId,
      content: message.msg,
    });
    return items;
  }

  if (message.msg_type === "chat.key_infos") {
    items.push({
      kind: "key_infos",
      id: genId("key_infos", chatMsgId, index),
      chat_msg_id: chatMsgId,
      data: pickKeyInfosData(message),
    });
    return items;
  }

  if (message.msg_type === "chat.outline") {
    items.push({
      kind: "outline",
      id: genId("outline", chatMsgId, index),
      chat_msg_id: chatMsgId,
      data: pickOutlineData(message),
    });
    return items;
  }

  if (message.msg_type === "chat.outline.new") {
    items.push({
      kind: "outline_new",
      id: genId("outline_new", chatMsgId, index),
      chat_msg_id: chatMsgId,
      data: pickOutlineNewData(message),
    });
    return items;
  }

  if (message.msg_type === "chat.outline.confirm") {
    items.push({
      kind: "outline_confirm",
      id: genId("outline_confirm", chatMsgId, index),
      chat_msg_id: chatMsgId,
    });
    return items;
  }

  if (message.msg_type === "chat.new_ver") {
    items.push({
      kind: "new_ver",
      id: genId("new_ver", chatMsgId, index),
      chat_msg_id: chatMsgId,
      data: pickNewVerData(message),
    });
    return items;
  }

  if (message.msg_type === "chat.nps.generate") {
    items.push({
      kind: "nps",
      id: genId("nps", chatMsgId, index),
      chat_msg_id: chatMsgId,
    });
    return items;
  }

  return items;
}

function findInsertIndex(items: SystemItem[], chatMsgId: number) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].chat_msg_id > chatMsgId) {
      return i;
    }
  }
  return items.length;
}

function mergeToolItem(
  target: SystemItem,
  nextItem: Extract<SystemItem, { kind: "tool" }>,
) {
  if (target.kind !== "tool") return;

  target.tool.toolList = [...(target.tool.toolList ?? [target.tool]), nextItem.tool];
  if (nextItem.tool.tool_desc) {
    target.tool.tool_desc = nextItem.tool.tool_desc;
  }
  if (typeof nextItem.tool.tool_finish === "boolean") {
    target.tool.tool_finish = nextItem.tool.tool_finish;
  }
  if (nextItem.tool.tool_ext !== undefined) {
    target.tool.tool_ext = nextItem.tool.tool_ext;
  }
  if (nextItem.tool.definition !== undefined) {
    target.tool.definition = nextItem.tool.definition;
  }
  if (nextItem.tool.input !== undefined) {
    target.tool.input = nextItem.tool.input;
  }
  if (nextItem.tool.output !== undefined) {
    target.tool.output = nextItem.tool.output;
  }
}

function insertSystemItems(items: SystemItem[], nextItems: SystemItem[]) {
  nextItems.forEach((nextItem) => {
    if (nextItem.kind === "tool") {
      const insertIndex = findInsertIndex(items, nextItem.chat_msg_id);
      const prevItem = insertIndex > 0 ? items[insertIndex - 1] : undefined;

      if (
        prevItem?.kind === "tool" &&
        prevItem.tool.tool_name === nextItem.tool.tool_name
      ) {
        mergeToolItem(prevItem, nextItem);
        return;
      }

      items.splice(insertIndex, 0, nextItem);
      return;
    }

    const insertIndex = findInsertIndex(items, nextItem.chat_msg_id);
    items.splice(insertIndex, 0, nextItem);
  });
}

function appendSystemItems(
  target: Extract<EvalChatMessage, { type: "system" }>,
  nextItems: SystemItem[],
  chatMsgId: number,
) {
  target.items = target.items.filter((item) => item.chat_msg_id !== chatMsgId);
  insertSystemItems(target.items, nextItems);
}

function mergeSystemItems(
  target: Extract<EvalChatMessage, { type: "system" }>,
  message: HistoryMessage,
  index: number,
) {
  const chatMsgId = message.chat_msg_id || 0;
  const msgTime = message.chat_msg_time || 0;

  if (msgTime > 0 && msgTime > (target.chat_msg_time || 0)) {
    target.chat_msg_time = msgTime;
  }

  if (target.chat_msg_id > chatMsgId) {
    target.chat_msg_id = chatMsgId;
  } else if (target.chat_msg_id === 0) {
    target.chat_msg_id = chatMsgId;
  }

  appendSystemItems(target, historyItemsFromMessage(message, index), chatMsgId);
}

function findActiveSystemMessage(
  chatMessageList: EvalChatMessage[],
): Extract<EvalChatMessage, { type: "system" }> | undefined {
  return chatMessageList.find(
    (message): message is Extract<EvalChatMessage, { type: "system" }> =>
      message.type === "system",
  );
}

export function parseHistoryToChatMessages(
  messages: HistoryMessage[],
): EvalChatMessage[] {
  const chatMessageList: EvalChatMessage[] = [];

  [...messages].reverse().forEach((message, index) => {
    if (isSystemMessage(message)) {
      const chatMsgId = message.chat_msg_id || index;
      const activeSystem = findActiveSystemMessage(chatMessageList);

      if (activeSystem) {
        mergeSystemItems(activeSystem, message, index);
      } else {
        const items = historyItemsFromMessage(message, index);
        chatMessageList.unshift({
          type: "system",
          id: genId("system", chatMsgId, index),
          chat_msg_id: chatMsgId,
          chat_msg_time: message.chat_msg_time,
          items,
        });
      }

      if (message.user_msg?.msg?.trim()) {
        chatMessageList.unshift({
          type: "user",
          id: genId("user", chatMsgId, index),
          chat_msg_id: chatMsgId,
          chat_msg_time: message.chat_msg_time,
          content: message.user_msg.msg.trim(),
        });
      }
      return;
    }

    if (message.msg_type === "error") {
      const chatMsgId = message.chat_msg_id || index;
      const items = historyItemsFromMessage(message, index);
      chatMessageList.unshift({
        type: "system",
        id: genId("system-error", chatMsgId, index),
        chat_msg_id: chatMsgId,
        chat_msg_time: message.chat_msg_time,
        items,
      });
    }
  });

  return chatMessageList.filter(
    (message) => message.type !== "system" || message.items.length > 0,
  );
}

export function formatTime(timestamp?: number) {
  if (!timestamp) return "";

  return new Date(timestamp * 1000).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
