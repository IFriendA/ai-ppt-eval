"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AnnotationUpsertInput,
  MessageAnnotation,
} from "@/lib/annotation/types";
import { annotationService } from "@/services/annotationService";

export type AnnotationSaveInput = Omit<AnnotationUpsertInput, "projectId">;

type AnnotationContextValue = {
  projectId: number | null;
  loading: boolean;
  getAnnotation: (chatMsgId: number) => MessageAnnotation | undefined;
  upsertAnnotation: (input: AnnotationSaveInput) => Promise<MessageAnnotation>;
  removeAnnotation: (chatMsgId: number) => Promise<void>;
};

const AnnotationContext = createContext<AnnotationContextValue | null>(null);

export function AnnotationProvider({
  projectId,
  children,
}: {
  projectId: number | null;
  children: ReactNode;
}) {
  const [annotations, setAnnotations] = useState<MessageAnnotation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setAnnotations([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    annotationService
      .listByProject(projectId)
      .then((items) => {
        if (!cancelled) {
          setAnnotations(items);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const annotationMap = useMemo(() => {
    return new Map(annotations.map((item) => [item.chatMsgId, item]));
  }, [annotations]);

  const getAnnotation = useCallback(
    (chatMsgId: number) => annotationMap.get(chatMsgId),
    [annotationMap],
  );

  const upsertAnnotation = useCallback(
    async (input: AnnotationSaveInput) => {
      if (!projectId) {
        throw new Error("projectId is required");
      }

      const next = await annotationService.upsert({
        ...input,
        projectId,
      });

      setAnnotations((prev) => {
        const others = prev.filter((item) => item.chatMsgId !== next.chatMsgId);
        return [...others, next];
      });

      return next;
    },
    [projectId],
  );

  const removeAnnotation = useCallback(
    async (chatMsgId: number) => {
      if (!projectId) {
        throw new Error("projectId is required");
      }

      await annotationService.remove(projectId, chatMsgId);
      setAnnotations((prev) => prev.filter((item) => item.chatMsgId !== chatMsgId));
    },
    [projectId],
  );

  const value = useMemo(
    () => ({
      projectId,
      loading,
      getAnnotation,
      upsertAnnotation,
      removeAnnotation,
    }),
    [projectId, loading, getAnnotation, upsertAnnotation, removeAnnotation],
  );

  return (
    <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>
  );
}

export function useAnnotation() {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error("useAnnotation must be used within AnnotationProvider");
  }
  return context;
}

export function useOptionalAnnotation() {
  return useContext(AnnotationContext);
}
