// ./src/utils/ai/providers/index.ts

import { AIProviderConfig, IAIProvider } from "../../../types/aiAgent.js";
import { VercelAIProvider } from "./vercel.provider.js";
import {
  OpenAIProvider,
  AnthropicProvider,
  GroqProvider,
  GoogleProvider,
} from "./direct.providers.js";

/**
 * Create an AI provider instance based on configuration
 *
 * @param config - Provider configuration
 * @returns Initialized provider instance
 * @throws Error if provider type is unsupported
 *
 * @example
 * // Using Vercel AI SDK with Groq
 * const provider = createProvider({
 *   provider: "vercel",
 *   vercelModel: { type: "groq", model: "llama-3.1-8b-instant" },
 * });
 *
 * @example
 * // Using direct OpenAI
 * const provider = createProvider({
 *   provider: "openai",
 *   model: "gpt-4o",
 *   apiKey: "sk-...",
 * });
 */
export function createProvider(config: AIProviderConfig): IAIProvider {
  switch (config.provider) {
    case "vercel":
      if (!config.vercelModel) {
        throw new Error("Vercel provider requires vercelModel configuration");
      }
      return new VercelAIProvider(config);

    case "openai":
      return new OpenAIProvider(config);

    case "anthropic":
      return new AnthropicProvider(config);

    case "groq":
      return new GroqProvider(config);

    case "google":
      return new GoogleProvider(config);

    default:
      throw new Error(`Unsupported provider: ${(config as any).provider}`);
  }
}

/**
 * Validate provider configuration before creating instance
 */
export function validateProviderConfig(config: AIProviderConfig): {
  valid: boolean;
  error?: string;
} {
  if (!config.provider) {
    return { valid: false, error: "Provider type is required" };
  }

  if (config.provider === "vercel" && !config.vercelModel) {
    return {
      valid: false,
      error: "Vercel provider requires vercelModel configuration",
    };
  }

  if (config.provider !== "vercel" && !config.model && !config.vercelModel) {
    return {
      valid: false,
      error: `${config.provider} provider requires model configuration`,
    };
  }

  return { valid: true };
}

// Re-export all providers
export * from "./base.js";
export * from "./vercel.provider.js";
export * from "./direct.providers.js";
