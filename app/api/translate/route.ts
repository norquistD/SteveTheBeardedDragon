import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { translateSchema } from "@/lib/schemas";
import { ApiResponse, ApiError } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY environment variable is not set",
        } as ApiError,
        { status: 500 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = translateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { text, source_language, target_language } = validationResult.data;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create prompt that asks for translation wrapped in <translation> tags
    const prompt = `Translate the following text from ${source_language} to ${target_language}. Wrap your translation in <translation> and </translation> tags. Only return the translation, nothing else.

Text to translate:
${text}`;

    // Call OpenAI chat completions API
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the response text
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        {
          success: false,
          error: "No response from OpenAI",
        } as ApiError,
        { status: 500 },
      );
    }

    // Parse translation from <translation> tags using regex
    const translationRegex = /<translation>([\s\S]*?)<\/translation>/;
    const match = responseText.match(translationRegex);

    if (!match || !match[1]) {
      return NextResponse.json(
        {
          success: false,
          error: "Translation tags not found in response. Response: " + responseText,
        } as ApiError,
        { status: 500 },
      );
    }

    const translation = match[1].trim();

    // Return the translated text
    return NextResponse.json(
      {
        success: true,
        data: { translation },
      } as ApiResponse<{ translation: string }>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Error translating text:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to translate text",
      } as ApiError,
      { status: 500 },
    );
  }
}

