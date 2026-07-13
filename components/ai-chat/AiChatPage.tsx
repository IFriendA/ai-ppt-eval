"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendPinovaChat } from "@/api/pinovaChatApi";
import { getUserInfo } from "@/api/userApi";
import type { UserInfo } from "@/api/types";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import ModelSelector from "@/components/ai-chat/ModelSelector";
import AppNav from "@/components/layout/AppNav";
import DokieBackground from "@/components/brand/DokieBackground";
import DokieLogo from "@/components/brand/DokieLogo";
import WorkspaceUserBar from "@/components/workspace/WorkspaceUserBar";
import { clearAuth, getStoredUser, setAuth } from "@/lib/auth";
import {
  getModelProviderMeta,
} from "@/lib/pinovaModelMeta";
import {
  PINOVA_DEFAULT_MODEL,
} from "@/lib/pinovaModels";

type ChatTurn = {
  id: string;
  question: string;
  answer: string;
};

function createTurnId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AiChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [model, setModel] = useState(PINOVA_DEFAULT_MODEL);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    getUserInfo()
      .then((res) => {
        if (res.error !== 0) {
          clearAuth();
          router.replace("/");
          return;
        }

        setAuth(res.data.user_info);
        setUser(res.data.user_info);
      })
      .catch(() => {
        clearAuth();
        router.replace("/");
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const turnId = createTurnId();
    setInput("");
    setError(null);
    setLoading(true);
    setTurns((prev) => [...prev, { id: turnId, question, answer: "" }]);

    try {
      const res = await sendPinovaChat({
        model,
        messages: [{ role: "user", content: question }],
        temperature: 0.7,
      });

      const answer = res.choices?.[0]?.message?.content?.trim() || "（无回复内容）";

      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId ? { ...turn, answer } : turn,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "请求失败";
      setError(message);
      setTurns((prev) => prev.filter((turn) => turn.id !== turnId));
      setInput(question);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleClear = () => {
    setTurns([]);
    setError(null);
    setInput("");
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/");
  };

  if (checkingAuth) {
    return (
      <div className="relative flex h-screen items-center justify-center">
        <DokieBackground variant="workspace" />
        <div className="relative text-sm text-mute">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-blue-3">
      <DokieBackground variant="workspace" />

      <aside className="relative z-10 flex w-[320px] shrink-0 flex-col border-e border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="border-b border-zinc-200/80 px-4 py-4">
          <DokieLogo size="sm" subtitle="Eval" />
          <div className="mt-4">
            <AppNav />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl border border-zinc-200/80 bg-light-gray/50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-default">
                模型选择
              </span>
              <span className="text-[11px] text-mute">单次对话</span>
            </div>

            <ModelSelector
              value={model}
              onChange={setModel}
              disabled={loading}
            />
          </div>

          <p className="mt-3 px-1 text-xs leading-5 text-mute">
            每次提问独立发送，不携带历史上下文。
          </p>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading || turns.length === 0}
            className="mt-4 w-full cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-default transition hover:bg-light-gray disabled:cursor-not-allowed disabled:opacity-50"
          >
            清空对话
          </button>
        </div>

        <WorkspaceUserBar user={user} onLogout={handleLogout} />
      </aside>

      <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="border-b border-zinc-200/80 bg-white/90 px-6 py-4 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-default">AI 对话</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${getModelProviderMeta(model).badgeClass}`}
            >
              {getModelProviderMeta(model).label}
            </span>
            <span className="font-mono text-sm text-mute">{model}</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/70">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {turns.length === 0 && !loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center text-sm text-mute">
                  选择模型后输入问题，按 Enter 发送（Shift+Enter 换行）
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-6">
                {turns.map((turn) => (
                  <div key={turn.id} className="flex flex-col gap-3">
                    <div className="ms-auto w-fit max-w-[85%] rounded-xl bg-light-gray px-4 py-3">
                      <div className="whitespace-pre-wrap text-sm leading-6 text-default">
                        {turn.question}
                      </div>
                    </div>

                    {turn.answer ? (
                      <div className="me-auto w-full max-w-[85%] rounded-xl border border-zinc-200/80 bg-white px-4 py-3">
                        <ChatMarkdown content={turn.answer} />
                      </div>
                    ) : (
                      <div className="me-auto rounded-xl border border-zinc-200/80 bg-white px-4 py-3 text-sm text-mute">
                        思考中...
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200/80 bg-white/95 px-6 py-4 backdrop-blur-sm">
            {error ? (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mx-auto flex max-w-3xl gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                rows={3}
                disabled={loading}
                className="min-h-[88px] flex-1 resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-default outline-none transition focus:border-blue disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading || !input.trim()}
                className="h-[88px] shrink-0 cursor-pointer rounded-xl bg-blue px-5 text-sm font-medium text-white transition hover:bg-blue-11 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "发送中..." : "发送"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
