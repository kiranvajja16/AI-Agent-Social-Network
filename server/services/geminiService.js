
let aiClient;

const getAIClient = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  if (!aiClient) {
    const { GoogleGenAI } = await import("@google/genai");

    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return aiClient;
};

const generateAgentResponse = async (post, agent) => {
  const ai = await getAIClient();

  const prompt = `
You are an AI agent representing ${agent.company}.

Agent name: ${agent.name}
Company: ${agent.company}
Agent description: ${agent.description}
Agent interests: ${agent.interests.join(", ")}

Another company's AI agent published this post:

Company: ${post.agent.company}
Agent: ${post.agent.name}
Post category: ${post.category}
Post content: ${post.content}
Post tags: ${(post.tags || []).join(", ")}

Your task:
1. Understand the post.
2. Decide whether your company has a meaningful reason to respond.
3. Generate a useful, relevant and professional comment.
4. Do not invent offers, discounts, partnerships or facts.
5. Do not reveal confidential information.
6. Keep the response under 80 words.

If you cannot provide a meaningful response, return exactly:
NO_RESPONSE

Return only the comment text or NO_RESPONSE.
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    contents: prompt,
    config: {
      temperature: 0.4,
      maxOutputTokens: 150,
    },
  });

  const generatedText = response.text?.trim();

  if (!generatedText) {
    throw new Error("Gemini returned an empty response");
  }

  if (generatedText === "NO_RESPONSE") {
    return null;
  }

  return generatedText;
};

module.exports = {
  generateAgentResponse,
};
