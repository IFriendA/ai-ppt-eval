"use client";

import type { KeyInfosData } from "@/api/chatMessageTypes";
import CollapsibleChatCard, { CardInfoRows } from "./CollapsibleChatCard";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  es: "Español",
  ar: "العربية",
};

export default function KeyInfosCard({ data }: { data: KeyInfosData }) {
  const summary = data.key_infos_topic || data.key_infos_scenario || "关键信息";

  return (
    <CollapsibleChatCard
      icon={<span className="text-sm">🗺️</span>}
      title="关键信息"
      summary={summary}
    >
      <div className="flex flex-col gap-3">
        <CardInfoRows
          rows={[
            { label: "主题", value: data.key_infos_topic },
            { label: "目标", value: data.key_infos_objective },
            { label: "场景", value: data.key_infos_scenario },
            { label: "受众", value: data.key_infos_audience },
            {
              label: "页数",
              value:
                data.key_infos_page_num === "auto"
                  ? "自动"
                  : data.key_infos_page_num || data.key_infos_page_count,
            },
            { label: "比例", value: data.key_infos_ratio },
            { label: "动画", value: data.key_infos_animation },
            {
              label: "语言",
              value: data.key_infos_language
                ? LANGUAGE_LABELS[data.key_infos_language] ||
                  data.key_infos_language
                : undefined,
            },
            {
              label: "联网搜索",
              value: data.key_infos_enable_web_search,
            },
          ]}
        />

        {data.key_infos_theme?.name ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
            <div className="mb-2 text-xs font-medium text-default">主题风格</div>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 text-sm text-mute">
                {data.key_infos_theme.name}
              </div>
              {data.key_infos_theme.screenshot ? (
                <img
                  src={data.key_infos_theme.screenshot}
                  alt={data.key_infos_theme.name}
                  className="h-[52px] w-[92px] shrink-0 rounded border border-zinc-200 object-cover"
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {data.key_infos_brand?.brand_name ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
            <div className="mb-2 text-xs font-medium text-default">品牌资产</div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 text-sm text-mute">
                {data.key_infos_brand.brand_name}
              </div>
              {data.key_infos_brand.brand_logo ? (
                <img
                  src={data.key_infos_brand.brand_logo}
                  alt={data.key_infos_brand.brand_name}
                  className="size-10 shrink-0 rounded border border-zinc-200 object-contain"
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </CollapsibleChatCard>
  );
}
