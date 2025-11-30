// ./src/utils/ai/providers/base.ts

import { IAIProvider, AIProviderConfig } from "../../../types/aiAgent.js";
import { ModelMessage } from "ai";

/**
 * Base provider class with common functionality
 * All providers should extend this class
 */
export abstract class BaseAIProvider implements IAIProvider {
  abstract name: string;

  protected config: AIProviderConfig;
  protected apiKey: string;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.apiKey = config.apiKey || this.getApiKeyFromEnv();

    if (!this.apiKey) {
      throw new Error(
        `API key is required for this provider. Set the appropriate environment variable or pass it in the config.`
      );
    }
  }

  /**
   * Get API key from environment variables
   * Each provider should override this to specify their env var
   */
  protected abstract getApiKeyFromEnv(): string;

  /**
   * Generate text completion
   */
  abstract generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    text: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }>;

  /**
   * Validate provider configuration
   */
  async validate(): Promise<boolean> {
    try {
      // Simple validation: try to generate text with minimal input
      await this.generateText({
        system: "You are a helpful assistant.",
        messages: [{ role: "user", content: "Hello" }],
        maxTokens: 10,
      });
      return true;
    } catch (error) {
      console.error(`❌ ${this.name} validation failed:`, error);
      return false;
    }
  }

  /**
   * Handle provider-specific errors
   */
  protected handleError(error: any): never {
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();

      // Rate limiting
      if (
        errorMsg.includes("rate limit") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("503") ||
        errorMsg.includes("429")
      ) {
        throw new Error(
          `${this.name} is currently rate limited or overloaded. Please try again in a few moments.`
        );
      }

      // Authentication errors
      if (
        errorMsg.includes("api key") ||
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("401") ||
        errorMsg.includes("403")
      ) {
        throw new Error(
          `${this.name} authentication failed. Please check your API key.`
        );
      }

      // Network errors
      if (
        errorMsg.includes("network") ||
        errorMsg.includes("econnrefused") ||
        errorMsg.includes("timeout")
      ) {
        throw new Error(
          `Network error connecting to ${this.name}. Please check your internet connection.`
        );
      }
    }

    // Generic error
    throw new Error(`${this.name} error: ${error?.message || "Unknown error"}`);
  }

  /**
   * Parse JSON from AI response
   * Handles various formats (with/without markdown code blocks)
   */
  protected parseJsonResponse<T = any>(text: string): T {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find JSON object/array in text
      const objectMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }

      throw new Error("Failed to parse JSON from AI response");
    }
  }
}
