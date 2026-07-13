export type PinovaChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type PinovaChatCompletionResponse = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  error?: string;
};

export async function sendPinovaChat(params: {
  model: string;
  messages: PinovaChatMessage[];
  temperature?: number;
}): Promise<PinovaChatCompletionResponse> {
  const response = await fetch("/api/pinova/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = (await response.json()) as PinovaChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }

  return data;
}
