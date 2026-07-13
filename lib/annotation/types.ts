export type AnnotationSeverity = 1 | 2 | 3;

export type MessageAnnotation = {
  id: string;
  projectId: number;
  chatMsgId: number;
  note: string;
  severity: AnnotationSeverity;
  createdAt: number;
  updatedAt: number;
};

export type AnnotationUpsertInput = Omit<
  MessageAnnotation,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;
};

export const ANNOTATION_SEVERITIES: Array<{
  value: AnnotationSeverity;
  label: string;
}> = [
  { value: 1, label: "低" },
  { value: 2, label: "中" },
  { value: 3, label: "高" },
];

export function getSeverityLabel(severity: AnnotationSeverity) {
  return (
    ANNOTATION_SEVERITIES.find((item) => item.value === severity)?.label ??
    String(severity)
  );
}
