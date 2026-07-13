"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo, loginEmail, sendEmailCode } from "@/api/userApi";
import { setAuth } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getUserInfo()
      .then((res) => {
        if (res.error === 0) {
          setAuth(res.data.user_info);
          router.replace("/workspace");
        }
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const sendCode = async (targetEmail: string) => {
    if (!EMAIL_REGEX.test(targetEmail)) {
      setError("请输入有效的邮箱地址");
      return false;
    }

    if (isSending) return false;

    setError(null);
    setMessage(null);
    setIsSending(true);

    const callbackUrl = `${window.location.origin}/?type=login&email=${encodeURIComponent(targetEmail)}&token=`;

    try {
      const res = await sendEmailCode(callbackUrl, targetEmail);

      if (res.error !== 0) {
        setError(res.msg || "发送验证码失败");
        return false;
      }

      setEmail(targetEmail);
      setStep("code");
      setCountdown(60);
      setMessage(`验证码已发送至 ${targetEmail}`);
      return true;
    } catch {
      setError("发送验证码失败，请稍后重试");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const submitCode = async (value: string) => {
    if (value.length !== 6 || isSubmitting) return;

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginEmail(email, value);

      if (res.error !== 0) {
        if (res.error === 10005) {
          setError("验证码错误");
          return;
        }

        if (res.error === 10006) {
          setError("验证码已过期");
          return;
        }

        setError(res.msg || "登录失败");
        return;
      }

      setAuth(res.data);
      router.replace("/workspace");
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="text-sm text-zinc-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-zinc-900">
          {step === "email" ? "欢迎回来" : "查收验证码"}
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          {step === "email"
            ? "使用邮箱验证码登录"
            : `验证码已发送至 ${email}`}
        </p>

        {step === "email" ? (
          <div className="mt-8 space-y-4">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
            />
            <button
              type="button"
              disabled={isSending}
              className="h-11 w-full cursor-pointer rounded-xl bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void sendCode(email)}
            >
              {isSending ? "发送中..." : "继续"}
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D/g, "");
                setCode(nextValue);
                setError(null);

                if (nextValue.length === 6) {
                  void submitCode(nextValue);
                }
              }}
              placeholder="6 位验证码"
              className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-center text-lg tracking-[0.3em] text-zinc-900 outline-none transition focus:border-zinc-400"
            />

            <div className="text-center text-sm text-zinc-500">
              没收到验证码？
              <button
                type="button"
                disabled={countdown > 0 || isSending}
                className="ms-1 cursor-pointer font-medium text-zinc-900 underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                onClick={() => void sendCode(email)}
              >
                {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
              </button>
            </div>

            <button
              type="button"
              disabled={code.length !== 6 || isSubmitting}
              className="h-11 w-full cursor-pointer rounded-xl bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void submitCode(code)}
            >
              {isSubmitting ? "登录中..." : "登录"}
            </button>

            <button
              type="button"
              className="h-11 w-full cursor-pointer rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
                setMessage(null);
              }}
            >
              返回修改邮箱
            </button>
          </div>
        )}

        {error ? (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        ) : null}
        {message ? (
          <p className="mt-4 text-center text-sm text-emerald-600">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
