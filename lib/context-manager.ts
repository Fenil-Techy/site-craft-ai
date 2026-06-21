/**
 * Context Window Manager for Site Craft AI
 * Manages sliding context window and summarizes older messages
 */

export interface Message {
  role: string;
  content: string;
}

/**
 * Summarizes older messages in a chat history if they exceed the limit.
 * Keeps the last `limit` messages intact.
 * Passes the API base URL to ensure correctness when called from client or server.
 */
export async function buildContextWindow(
  messages: Message[],
  limit = 6
): Promise<{
  recentMessages: Message[];
  summaryMessage: Message | null;
}> {
  if (!messages || messages.length <= limit) {
    return {
      recentMessages: messages || [],
      summaryMessage: null,
    };
  }

  // Split messages into older and recent
  const olderMessages = messages.slice(0, messages.length - limit);
  const recentMessages = messages.slice(messages.length - limit);

  try {
    // Request a summary from the AI model API (non-streaming)
    // We send a request to our local API route. On client, "/api/ai-model" is fine.
    const response = await fetch("/api/ai-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it",
        stream: false,
        messages: [
          {
            role: "system",
            content: "You are a website design assistant. Summarize the user's design requests and edits from the conversation history in 2-3 sentences. Focus only on what they wanted to build, edit, or style. Be concise and direct, without preamble.",
          },
          {
            role: "user",
            content: JSON.stringify(olderMessages.map(m => ({
              role: m.role,
              // Skip large code blocks if present to save token count
              content: m.content.length > 500 ? m.content.substring(0, 500) + "..." : m.content
            }))),
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Handle either standard OpenAI format or direct message format
      const summary = data.choices?.[0]?.message?.content?.trim();
      if (summary) {
        return {
          recentMessages,
          summaryMessage: {
            role: "system",
            content: `Previous work summary (keep these requirements in mind for consistency): ${summary}`,
          },
        };
      }
    }
  } catch (error) {
    console.error("[CONTEXT_MANAGER_ERROR] Failed to fetch dynamic summary:", error);
  }

  // Static/local fallback if the API fails or is slow
  const userPrompts = olderMessages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("; ");
  
  const truncatedSummary = userPrompts.length > 250 
    ? userPrompts.slice(0, 250) + "..." 
    : userPrompts;

  return {
    recentMessages,
    summaryMessage: {
      role: "system",
      content: `Previous request history summary: ${truncatedSummary || "Initial project setup"}`,
    },
  };
}
