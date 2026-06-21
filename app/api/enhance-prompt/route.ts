import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { getOrCreateUser } from "@/lib/user-helper";
import { AI_MODELS } from "@/config/models";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return new Response(
        JSON.stringify({ error: "User profile not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit: using aiGeneration limit
    const limited = await checkRateLimit(req, dbUser.email, "aiGeneration");
    if (limited) return limited;

    const { prompt, model } = await req.json();
    const selectedModel = model || AI_MODELS[0].id;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "prompt is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages = [
      {
        role: "system",
        content: "You are an expert prompt engineer for a portfolio website generator. Expand the following short user request into a detailed, professional specification for a portfolio website. Keep the focus entirely on the Mobile-first, responsive design, layout, sections, features, and content. The final output should just be the enhanced prompt without any introductory text, quotes, or markdown wrappers. Do not add any conversational filler. Just output the enhanced prompt text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        stream: false,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ENHANCE_PROMPT_ERROR] Failed:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to enhance prompt. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      return new Response(
        JSON.stringify({ error: "Received empty enhanced prompt from AI." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ enhancedPrompt }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[ENHANCE_PROMPT_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
