// ./src/utils/ai/agents/index.ts

import { IAIAgent, IAIProvider } from "../../../types/aiAgent.js";
import { TitleGeneratorAgent } from "./titleGenerator.agent.js";

/**
 * Supported agent types
 */
export type AgentType = "title-generator";
// Future agents can be added here:
// | "summarizer"
// | "code-reviewer"
// | "translation"
// | "sentiment-analyzer"

/**
 * Agent factory - creates agent instances with the specified provider
 *
 * @param type - The type of agent to create
 * @param provider - The AI provider to use for this agent
 * @returns Initialized agent instance
 * @throws Error if agent type is unsupported
 *
 * @example
 * ```typescript
 * const provider = createProvider({
 *   provider: "vercel",
 *   vercelModel: { type: "groq", model: "llama-3.1-8b-instant" },
 * });
 *
 * const titleAgent = createAgent("title-generator", provider);
 * const result = await titleAgent.execute({ messages: [...] });
 * ```
 */
export function createAgent(type: AgentType, provider: IAIProvider): IAIAgent {
  switch (type) {
    case "title-generator":
      return new TitleGeneratorAgent(provider);

    // Future agents:
    // case "summarizer":
    //   return new SummarizerAgent(provider);
    // case "code-reviewer":
    //   return new CodeReviewerAgent(provider);

    default:
      throw new Error(`Unsupported agent type: ${type}`);
  }
}

/**
 * Agent registry - manages multiple agent instances
 */
export class AgentRegistry {
  private agents: Map<string, IAIAgent> = new Map();

  /**
   * Register an agent with a custom identifier
   */
  register(id: string, agent: IAIAgent): void {
    this.agents.set(id, agent);
    console.log(`✅ Registered agent: ${id} (${agent.name})`);
  }

  /**
   * Get a registered agent by ID
   */
  get(id: string): IAIAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Check if an agent is registered
   */
  has(id: string): boolean {
    return this.agents.has(id);
  }

  /**
   * Remove an agent from the registry
   */
  unregister(id: string): boolean {
    const existed = this.agents.delete(id);
    if (existed) {
      console.log(`🗑️ Unregistered agent: ${id}`);
    }
    return existed;
  }

  /**
   * Get all registered agent IDs
   */
  list(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Clear all registered agents
   */
  clear(): void {
    this.agents.clear();
    console.log("🗑️ Cleared all registered agents");
  }
}

// Re-export all agents
export * from "./base.agent.js";
export * from "./titleGenerator.agent.js";
