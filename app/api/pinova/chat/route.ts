import { NextRequest } from "next/server";

const PINOVA_CHAT_URL = "https://pinova.ai/v1/chat/completions";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
};

type PinovaErrorResponse = {
  error?: {
    message?: string;
  };
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.PINOVA_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "PINOVA_API_KEY is not configured" },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.model?.trim()) {
    return Response.json({ error: "model is required" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "messages is required" }, { status: 400 });
  }

  try {
    const response = await fetch(PINOVA_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
      }),
    });

    const data = (await response.json()) as PinovaErrorResponse & {
      choices?: Array<{
        message?: {
          role?: string;
          content?: string;
        };
      }>;
    };

    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Chat request failed" },
        { status: response.status },
      );
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to reach Pinova API" }, { status: 502 });
  }
}
