// ./src/utils/ai/providers/vercel.provider.ts

import { generateText, LanguageModel } from "ai";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { BaseAIProvider } from "./base.js";
import { AIProviderConfig, VercelModelConfig } from "../../../types/aiAgent.js";
import { ModelMessage } from "ai";

/**
 * Vercel AI SDK Provider
 * Supports multiple model providers through Vercel's unified interface
 */
export class VercelAIProvider extends BaseAIProvider {
  name = "vercel";
  private modelConfig: VercelModelConfig;
  private model: LanguageModel;

  constructor(config: AIProviderConfig) {
    super(config);

    if (!config.vercelModel) {
      throw new Error("Vercel provider requires vercelModel configuration");
    }

    this.modelConfig = config.vercelModel;
    this.model = this.initializeModel();
  }

  /**
   * Initialize the appropriate model based on configuration
   */
  private initializeModel(): LanguageModel {
    const { type, model } = this.modelConfig;

    switch (type) {
      case "groq":
        return groq(model);

      case "openai":
        return openai(model);

      case "google":
        return google(model);

      case "anthropic":
        return anthropic(model);

      default:
        throw new Error(`Unsupported Vercel model type: ${type}`);
    }
  }

  protected getApiKeyFromEnv(): string {
    // modelConfig might not be set yet when called from base constructor
    // In that case, return empty string and let the config.apiKey be used
    if (!this.modelConfig) {
      return "";
    }

    // Try to get API key based on model type
    const { type } = this.modelConfig;

    switch (type) {
      case "groq":
        return process.env.GROQ_API_KEY || "";
      case "openai":
        return process.env.OPENAI_API_KEY || "";
      case "google":
        return process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
      case "anthropic":
        return process.env.ANTHROPIC_API_KEY || "";
      default:
        return "";
    }
  }

  async generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const result = await generateText({
        model: this.model,
        system: params.system,
        messages: params.messages,
        temperature: params.temperature ?? this.config.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? this.config.maxTokens ?? 4096,
        maxRetries: this.config.maxRetries ?? 2,
      });

      return {
        text: result.text,
        usage: result.usage
          ? {
              inputTokens: result.usage.inputTokens,
              outputTokens: result.usage.outputTokens,
              totalTokens: result.usage.totalTokens,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
