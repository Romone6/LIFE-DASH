export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterRequest = {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
};

export type OpenRouterResponse = {
  id: string;
  model: string;
  choices: Array<{ message: { content: string } }>
};

export class OpenRouterClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(opts: { apiKey: string; baseUrl?: string }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? "https://openrouter.ai/api/v1";
  }

  async chat(req: OpenRouterRequest): Promise<OpenRouterResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(req)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${text}`);
    }

    return (await res.json()) as OpenRouterResponse;
  }
}
