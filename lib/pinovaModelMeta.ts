import { PINOVA_MODELS } from "@/lib/pinovaModels";

export type ModelProvider =
  | "claude"
  | "openai"
  | "gemini"
  | "deepseek"
  | "kimi"
  | "glm"
  | "minimax"
  | "media"
  | "embedding"
  | "other";

export type ModelProviderMeta = {
  id: ModelProvider;
  label: string;
  badgeClass: string;
};

export const MODEL_PROVIDER_META: Record<ModelProvider, ModelProviderMeta> = {
  claude: {
    id: "claude",
    label: "Claude",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    badgeClass: "bg-blue-soft text-blue-11",
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  kimi: {
    id: "kimi",
    label: "Kimi",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  glm: {
    id: "glm",
    label: "GLM",
    badgeClass: "bg-rose-100 text-rose-700",
  },
  minimax: {
    id: "minimax",
    label: "MiniMax",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  media: {
    id: "media",
    label: "Media",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700",
  },
  embedding: {
    id: "embedding",
    label: "Embedding",
    badgeClass: "bg-zinc-100 text-zinc-600",
  },
  other: {
    id: "other",
    label: "Other",
    badgeClass: "bg-light-gray text-mute",
  },
};

const PROVIDER_ORDER: ModelProvider[] = [
  "claude",
  "openai",
  "gemini",
  "deepseek",
  "kimi",
  "glm",
  "minimax",
  "media",
  "embedding",
  "other",
];

export function getModelProvider(modelId: string): ModelProvider {
  const id = modelId.toLowerCase();

  if (id.startsWith("claude-")) return "claude";
  if (
    id.startsWith("gpt-") ||
    id.startsWith("chatgpt-") ||
    id.startsWith("o1") ||
    id.startsWith("o3") ||
    id.startsWith("o4")
  ) {
    return "openai";
  }
  if (id.startsWith("gemini-")) return "gemini";
  if (id.startsWith("deepseek") || id.startsWith("deepseek-")) return "deepseek";
  if (id.startsWith("kimi-")) return "kimi";
  if (id.startsWith("glm-")) return "glm";
  if (id.startsWith("minimax-")) return "minimax";
  if (
    id.startsWith("imagen-") ||
    id.startsWith("veo") ||
    id.startsWith("sora")
  ) {
    return "media";
  }
  if (id.startsWith("text-embedding-")) return "embedding";

  return "other";
}

export function getModelProviderMeta(modelId: string): ModelProviderMeta {
  return MODEL_PROVIDER_META[getModelProvider(modelId)];
}

export type ModelGroup = {
  provider: ModelProvider;
  label: string;
  badgeClass: string;
  models: string[];
};

export function groupPinovaModels(models: readonly string[] = PINOVA_MODELS) {
  const grouped = new Map<ModelProvider, string[]>();

  for (const model of models) {
    const provider = getModelProvider(model);
    const list = grouped.get(provider) ?? [];
    list.push(model);
    grouped.set(provider, list);
  }

  return PROVIDER_ORDER.flatMap((provider) => {
    const providerModels = grouped.get(provider);
    if (!providerModels?.length) return [];

    const meta = MODEL_PROVIDER_META[provider];
    return [
      {
        provider,
        label: meta.label,
        badgeClass: meta.badgeClass,
        models: providerModels,
      },
    ];
  });
}

export function filterModelGroups(
  groups: ModelGroup[],
  query: string,
): ModelGroup[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return groups;

  return groups
    .map((group) => ({
      ...group,
      models: group.models.filter((model) =>
        model.toLowerCase().includes(keyword),
      ),
    }))
    .filter((group) => group.models.length > 0);
}
