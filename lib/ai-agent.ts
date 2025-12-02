import { TitleGeneratorAgent } from "@untools/ai-toolkit";

export async function generateTitle(content: string): Promise<string | null> {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const provider = process.env.GROQ_API_KEY ? "groq" : "openai";
    const model = process.env.GROQ_API_KEY ? "llama-3.1-8b-instant" : "gpt-4o";

    if (!apiKey) {
      console.warn("No API key found for title generation");
      return null;
    }

    const agent = new TitleGeneratorAgent({
      provider,
      apiKey,
      model,
    });

    const result = await agent.execute({
      messages: [
        {
          role: "user",
          content: `Generate a concise and descriptive title for the following markdown content:\n\n${content.slice(
            0,
            2000
          )}`,
        },
      ],
    });

    return result.data?.title || null;
  } catch (error) {
    console.error("Error generating title:", error);
    return null;
  }
}
