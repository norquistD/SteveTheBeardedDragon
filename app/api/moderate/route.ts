import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { moderateSchema } from "@/lib/schemas";
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
    const validationResult = moderateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { input } = validationResult.data;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI moderation API
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: input,
    });

    // Return the moderation results
    return NextResponse.json(
      {
        success: true,
        data: response,
      } as ApiResponse<typeof response>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Error moderating content:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to moderate content",
      } as ApiError,
      { status: 500 },
    );
  }
}

