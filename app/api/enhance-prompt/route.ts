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
        content: "You are an expert prompt engineer. Enhance the user's short request into a concise, professional, and meaningful design prompt for a portfolio website. Focus on key layout, sections, theme style, and unique professional details. The enhanced prompt MUST be short, concise, and punchy—ideally between 40 to 80 words (maximum 2 to 3 sentences or a brief bulleted list). Do not output any introductory text, explanation, filler, quotes, or markdown wrappers. Output ONLY the enhanced prompt.",
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
        max_tokens: 150,
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
