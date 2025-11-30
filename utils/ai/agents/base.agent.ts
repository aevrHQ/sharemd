// ./src/utils/ai/agents/base.agent.ts

import {
  IAIAgent,
  IAIProvider,
  AgentContext,
  AgentResult,
} from "../../../types/aiAgent.js";
import { ModelMessage } from "ai";

/**
 * Base agent class with common functionality
 * All agents should extend this class
 */
export abstract class BaseAIAgent<TInput = any, TOutput = any>
  implements IAIAgent<TInput, TOutput>
{
  abstract name: string;
  abstract description: string;

  provider: IAIProvider;

  constructor(provider: IAIProvider) {
    this.provider = provider;
  }

  /**
   * Build the system prompt for this agent
   * Agents should override this to provide specific instructions
   */
  abstract buildSystemPrompt(context?: AgentContext): string;

  /**
   * Convert input to messages for the AI provider
   * Agents should override this to handle their specific input format
   */
  protected abstract buildMessages(
    input: TInput,
    context?: AgentContext
  ): ModelMessage[];

  /**
   * Parse AI response into agent output
   * Agents should override this to handle their specific output format
   */
  protected abstract parseResponse(
    text: string,
    context?: AgentContext
  ): TOutput;

  /**
   * Execute the agent with given input
   */
  async execute(
    input: TInput,
    context?: AgentContext
  ): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();

    try {
      console.log(`🤖 Executing agent: ${this.name}`);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);

      // Build messages from input
      const messages = this.buildMessages(input, context);

      // Generate text using provider
      const result = await this.provider.generateText({
        system: systemPrompt,
        messages,
        temperature: this.getTemperature(),
        maxTokens: this.getMaxTokens(),
      });

      // Parse response
      const output = this.parseResponse(result.text, context);

      const executionTime = Date.now() - startTime;

      console.log(`✅ Agent ${this.name} completed in ${executionTime}ms`);

      return {
        success: true,
        data: output,
        usage: result.usage,
        metadata: {
          executionTime,
          provider: this.provider.name,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      console.error(`❌ Agent ${this.name} failed:`, error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          executionTime,
          provider: this.provider.name,
        },
      };
    }
  }

  /**
   * Get temperature for this agent
   * Agents can override to customize
   */
  protected getTemperature(): number {
    return 0.7;
  }

  /**
   * Get max tokens for this agent
   * Agents can override to customize
   */
  protected getMaxTokens(): number {
    return 1024;
  }

  /**
   * Validate input before execution
   * Agents can override to add validation
   */
  protected validateInput(input: TInput): { valid: boolean; error?: string } {
    return { valid: true };
  }
}
