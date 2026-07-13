"use client";

import { useState } from "react";
import type { UserInfo } from "@/api/types";

function getDisplayName(user: UserInfo) {
  return user.nickname?.trim() || user.email?.trim() || "用户";
}

function getAvatarFallback(user: UserInfo) {
  const source = user.nickname?.trim() || user.email?.trim() || "U";
  return source.charAt(0).toUpperCase();
}

export default function WorkspaceUserBar({
  user,
  onLogout,
}: {
  user: UserInfo | null;
  onLogout: () => void;
}) {
  const [avatarError, setAvatarError] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-end border-t border-zinc-200/80 p-3">
        <button
          type="button"
          className="h-9 cursor-pointer rounded-lg border border-zinc-200 px-4 text-sm text-mute transition hover:bg-light-gray hover:text-default"
          onClick={onLogout}
        >
          退出登录
        </button>
      </div>
    );
  }

  const displayName = getDisplayName(user);
  const showAvatarImage = Boolean(user.avatar) && !avatarError;

  return (
    <div className="border-t border-zinc-200/80 p-3">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-blue-soft">
            {showAvatarImage ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="size-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="font-['Figtree'] text-sm font-semibold text-blue">
                {getAvatarFallback(user)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div
              className="truncate text-sm font-medium leading-5 text-default"
              title={displayName}
            >
              {displayName}
            </div>
            {user.email ? (
              <div
                className="truncate text-xs leading-4 text-mute"
                title={user.email}
              >
                {user.email}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="h-9 shrink-0 cursor-pointer rounded-lg border border-zinc-200 px-3 text-sm text-mute transition hover:bg-light-gray hover:text-default"
          onClick={onLogout}
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
