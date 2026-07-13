import type {
  AnnotationUpsertInput,
  MessageAnnotation,
} from "@/lib/annotation/types";

const STORAGE_KEY = "eval_annotations_v1";

export interface AnnotationService {
  listByProject(projectId: number): Promise<MessageAnnotation[]>;
  upsert(input: AnnotationUpsertInput): Promise<MessageAnnotation>;
  remove(projectId: number, chatMsgId: number): Promise<void>;
}

function makeStorageKey(projectId: number, chatMsgId: number) {
  return `${projectId}:${chatMsgId}`;
}

function readStore(): Record<string, MessageAnnotation> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, MessageAnnotation>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, MessageAnnotation>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function createAnnotationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `annotation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const annotationService: AnnotationService = {
  async listByProject(projectId) {
    const store = readStore();
    return Object.values(store).filter(
      (annotation) => annotation.projectId === projectId,
    );
  },

  async upsert(input) {
    const store = readStore();
    const key = makeStorageKey(input.projectId, input.chatMsgId);
    const now = Date.now();
    const existing = store[key];
    const next: MessageAnnotation = {
      id: input.id ?? existing?.id ?? createAnnotationId(),
      projectId: input.projectId,
      chatMsgId: input.chatMsgId,
      note: input.note.trim(),
      severity: input.severity,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    store[key] = next;
    writeStore(store);
    return next;
  },

  async remove(projectId, chatMsgId) {
    const store = readStore();
    const key = makeStorageKey(projectId, chatMsgId);
    if (!store[key]) return;

    delete store[key];
    writeStore(store);
  },
};
