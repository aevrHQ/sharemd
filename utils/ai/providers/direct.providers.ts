// ./src/utils/ai/providers/direct.providers.ts

import { BaseAIProvider } from "./base.js";
import { AIProviderConfig } from "../../../types/aiAgent.js";
import { ModelMessage } from "ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Direct OpenAI Provider
 */
export class OpenAIProvider extends BaseAIProvider {
  name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || "gpt-4o";
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: config.baseUrl,
    });
  }

  protected getApiKeyFromEnv(): string {
    return process.env.OPENAI_API_KEY || "";
  }

  async generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = params.system
        ? [
            { role: "system", content: params.system },
            ...(params.messages as any),
          ]
        : (params.messages as any);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: params.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? this.config.maxTokens,
      });

      return {
        text: response.choices[0]?.message?.content || "",
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}

/**
 * Direct Anthropic Provider
 */
export class AnthropicProvider extends BaseAIProvider {
  name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || "claude-sonnet-4-20250514";
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  protected getApiKeyFromEnv(): string {
    return process.env.ANTHROPIC_API_KEY || "";
  }

  async generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      // Filter out system messages as Anthropic handles them separately
      const filteredMessages = params.messages.filter(
        (msg) => msg.role !== "system"
      );

      const response = await this.client.messages.create({
        model: this.model,
        system: params.system,
        messages: filteredMessages as any,
        temperature: params.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? this.config.maxTokens ?? 1024,
      });

      const text =
        response.content[0]?.type === "text" ? response.content[0].text : "";

      return {
        text,
        usage: response.usage
          ? {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
              totalTokens:
                response.usage.input_tokens + response.usage.output_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}

/**
 * Direct Groq Provider
 */
export class GroqProvider extends BaseAIProvider {
  name = "groq";
  private client: Groq;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || "llama-3.1-8b-instant";
    this.client = new Groq({
      apiKey: this.apiKey,
    });
  }

  protected getApiKeyFromEnv(): string {
    return process.env.GROQ_API_KEY || "";
  }

  async generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const messages: Groq.Chat.ChatCompletionMessageParam[] = params.system
        ? [
            { role: "system", content: params.system },
            ...(params.messages as any),
          ]
        : (params.messages as any);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: params.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? this.config.maxTokens,
      });

      return {
        text: response.choices[0]?.message?.content || "",
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}

/**
 * Direct Google Provider
 */
export class GoogleProvider extends BaseAIProvider {
  name = "google";
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || "gemini-2.5-flash";
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  protected getApiKeyFromEnv(): string {
    return process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  }

  async generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: params.system,
      });

      // Convert messages to Google format
      const contents = params.messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content as string }],
      }));

      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: params.temperature ?? this.config.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens ?? this.config.maxTokens,
        },
      });

      const response = result.response;
      const text = response.text();

      return {
        text,
        usage: response.usageMetadata
          ? {
              inputTokens: response.usageMetadata.promptTokenCount || 0,
              outputTokens: response.usageMetadata.candidatesTokenCount || 0,
              totalTokens: response.usageMetadata.totalTokenCount || 0,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
