"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/workspace", label: "评测工作台" },
  { href: "/chat", label: "AI 对话" },
] as const;

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full gap-1 rounded-xl bg-light-gray p-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-center text-xs font-medium transition ${
              isActive
                ? "bg-white text-default shadow-sm"
                : "text-mute hover:text-default"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
