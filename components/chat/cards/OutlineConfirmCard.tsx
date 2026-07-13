"use client";

export default function OutlineConfirmCard() {
  return (
    <div className="flex h-8 items-center gap-2 self-start rounded-lg border border-dashed border-zinc-300 bg-light-gray px-3">
      <span className="text-sm">✅</span>
      <span className="text-xs font-medium text-mute">大纲待确认（评测只读）</span>
    </div>
  );
}
