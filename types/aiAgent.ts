// ./src/types/aiAgent.ts

import { ModelMessage } from "ai";

/**
 * Supported AI providers
 */
export type AIProviderType =
  | "vercel" // Vercel AI SDK (supports multiple models)
  | "openai" // Direct OpenAI
  | "anthropic" // Direct Anthropic
  | "groq" // Direct Groq
  | "google"; // Direct Google

/**
 * Vercel AI SDK model configurations
 */
export type VercelModelConfig =
  | { type: "groq"; model: string } // e.g., "llama-3.1-8b-instant"
  | { type: "openai"; model: string } // e.g., "gpt-4o"
  | { type: "google"; model: string } // e.g., "gemini-2.5-flash"
  | { type: "anthropic"; model: string }; // e.g., "claude-sonnet-4"

/**
 * Provider configuration for creating AI agents
 */
export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey?: string;
  baseUrl?: string;

  // For Vercel provider, specify the underlying model
  vercelModel?: VercelModelConfig;

  // For direct providers, specify the model directly
  model?: string;

  // Optional configuration
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
}

/**
 * Agent execution context
 */
export interface AgentContext {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Agent execution result
 */
export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Base AI Provider interface
 * All providers must implement this interface
 */
export interface IAIProvider {
  name: string;

  /**
   * Generate text completion
   */
  generateText(params: {
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
  validate(): Promise<boolean>;
}

/**
 * Base AI Agent interface
 * All agents must implement this interface
 */
export interface IAIAgent<TInput = any, TOutput = any> {
  name: string;
  description: string;
  provider: IAIProvider;

  /**
   * Execute the agent with given input
   */
  execute(input: TInput, context?: AgentContext): Promise<AgentResult<TOutput>>;

  /**
   * Build the system prompt for this agent
   */
  buildSystemPrompt(context?: AgentContext): string;
}

/**
 * Title generation specific types
 */
export interface TitleGenerationInput {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  maxLength?: number;
  context?: string;
}

export interface TitleGenerationOutput {
  title: string;
  confidence?: number;
}
