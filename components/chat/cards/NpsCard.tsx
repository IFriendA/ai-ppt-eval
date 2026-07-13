"use client";

import CollapsibleChatCard from "./CollapsibleChatCard";

export default function NpsCard() {
  return (
    <CollapsibleChatCard
      icon={<span className="text-sm">💬</span>}
      title="生成效果反馈"
      summary="评测平台仅展示，不支持提交反馈"
    >
      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm leading-6 text-mute">
        主产品在此位置会展示 NPS 反馈卡片（好评 / 一般 / 差评）。
        评测平台为只读历史查看，不接入反馈提交与弹窗流程。
      </div>
    </CollapsibleChatCard>
  );
}
