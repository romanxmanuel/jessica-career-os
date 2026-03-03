// Multi-provider AI client.
// Checks for API keys in this order: OPENROUTER_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY.
// Use whichever key you have — add it to .env.local and it will work automatically.

export type AIProvider = "openrouter" | "anthropic" | "openai" | "none";

interface AIClientConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseURL?: string;
}

export function detectProvider(): AIClientConfig | null {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: "openrouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: "anthropic/claude-sonnet-4-5",
      baseURL: "https://openrouter.ai/api/v1",
    };
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-haiku-4-5-20251001",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    };
  }

  return null;
}

export function isAIAvailable(): boolean {
  return detectProvider() !== null;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CompletionOptions {
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

/**
 * Send a chat completion request using whichever provider is configured.
 * Returns the assistant's text response.
 */
export async function chatCompletion(options: CompletionOptions): Promise<string> {
  const config = detectProvider();

  if (!config) {
    throw new Error(
      "No AI API key configured. Add OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY to your .env.local file."
    );
  }

  const { provider, apiKey, model, baseURL } = config;
  const { system, messages, maxTokens = 3000 } = options;

  if (provider === "anthropic") {
    // Use direct fetch (Anthropic Messages API) — avoids Node.js SDK issues in serverless
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: system ?? undefined,
        messages: messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error: ${res.status} — ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  // OpenAI-compatible API (covers OpenRouter and OpenAI directly)
  const url = baseURL
    ? `${baseURL}/chat/completions`
    : "https://api.openai.com/v1/chat/completions";

  const allMessages: ChatMessage[] = system
    ? [{ role: "system", content: system }, ...messages]
    : messages;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(provider === "openrouter"
        ? {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Jessica Career OS",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error (${provider}): ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
