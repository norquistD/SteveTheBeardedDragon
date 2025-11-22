import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateAudioSchema } from "@/lib/schemas";
import { ApiError } from "@/lib/types";

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
    const validationResult = generateAudioSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { prompt, voice, format } = validationResult.data;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert wav to mp3 if needed (TTS API doesn't support wav)
    const ttsFormat = format === "wav" ? "mp3" : format;

    // Generate audio using Text-to-Speech API
    const response = await openai.audio.speech.create({
      model: "tts-1",
      input: prompt,
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      response_format: ttsFormat as "mp3" | "opus" | "aac" | "flac",
    });

    // Convert the response stream to a buffer
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Determine content type based on format (use ttsFormat for actual format)
    const contentTypeMap: Record<string, string> = {
      wav: "audio/mpeg", // Converted to mp3
      mp3: "audio/mpeg",
      opus: "audio/opus",
      aac: "audio/aac",
      flac: "audio/flac",
    };

    const contentType = contentTypeMap[format] || "audio/mpeg";
    const fileExtension = ttsFormat;

    // Return audio file as binary response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="audio.${fileExtension}"`,
      },
    });
  } catch (error) {
    console.error("Error generating audio:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate audio",
      } as ApiError,
      { status: 500 },
    );
  }
}

