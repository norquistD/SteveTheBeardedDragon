import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ApiResponse, ApiError } from "@/lib/types";
import { uploadAudioToBlob } from "@/lib/blob-storage";

interface Block {
  leftType: "paragraph" | "url";
  leftContent: string;
  rightType: "paragraph" | "url";
  rightContent: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = parseInt(params.id);
    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid location ID" } as ApiError,
        { status: 400 }
      );
    }

    const body = await request.json();
    const { language_id } = body;

    if (!language_id) {
      return NextResponse.json(
        {
          success: false,
          error: "language_id is required",
        } as ApiError,
        { status: 400 }
      );
    }

    const languageId = parseInt(language_id);
    if (isNaN(languageId)) {
      return NextResponse.json(
        { success: false, error: "Invalid language_id" } as ApiError,
        { status: 400 }
      );
    }

    // Verify location exists
    const locationCheck = await sql`
      SELECT location_id FROM locations WHERE location_id = ${locationId}
    `;
    if (locationCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" } as ApiError,
        { status: 404 }
      );
    }

    // Verify language exists and get language code
    const languageCheck = await sql`
      SELECT language_id, language_code FROM languages WHERE language_id = ${languageId}
    `;
    if (languageCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Language not found" } as ApiError,
        { status: 404 }
      );
    }
    const languageCode = languageCheck[0].language_code;

    // Fetch location content for the given language directly from database
    const contentRows = (await sql`
      SELECT 
        b.position,
        c1.content as left_content,
        c1.is_url as left_is_url,
        c2.content as right_content,
        c2.is_url as right_is_url
      FROM blocks b
      LEFT JOIN contents c1 ON b.content_id_left = c1.content_id 
        AND c1.language_id = ${languageId}
      LEFT JOIN contents c2 ON b.content_id_right = c2.content_id
        AND c2.language_id = ${languageId}
      WHERE b.location_id = ${locationId}
      AND (c1.content_id IS NOT NULL AND c2.content_id IS NOT NULL)
      AND b.position IS NOT NULL
      AND b.position != 99
      ORDER BY b.position
    `) as Array<{
      position: number | null;
      left_content: string | null;
      left_is_url: boolean | null;
      right_content: string | null;
      right_is_url: boolean | null;
    }>;

    // Get title
    const titleRow = (await sql`
      SELECT c1.content as left_content
      FROM blocks b
      LEFT JOIN contents c1 ON b.content_id_left = c1.content_id 
        AND c1.language_id = ${languageId}
      WHERE b.location_id = ${locationId}
      AND b.position IS NULL
      AND c1.content_id IS NOT NULL
      LIMIT 1
    `) as Array<{ left_content: string | null }>;

    const title = titleRow.length > 0 ? (titleRow[0].left_content || "") : "";
    const content: Block[] = contentRows.map((row) => ({
      leftType: row.left_is_url ? ("url" as const) : ("paragraph" as const),
      leftContent: row.left_content || "",
      rightType: row.right_is_url ? ("url" as const) : ("paragraph" as const),
      rightContent: row.right_content || "",
    }));

    // Combine title and all content blocks into a single text string
    const textParts: string[] = [];

    // Add title
    if (title && title.trim() !== "") {
      textParts.push(title.trim());
    }

    // Add content blocks (only paragraph content, skip URLs/images)
    // Read left content first, then right content
    for (const block of content as Block[]) {
      if (block.leftType === "paragraph" && block.leftContent.trim() !== "") {
        textParts.push(block.leftContent.trim());
      }
      if (block.rightType === "paragraph" && block.rightContent.trim() !== "") {
        textParts.push(block.rightContent.trim());
      }
    }

    if (textParts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No content to convert to speech" } as ApiError,
        { status: 400 }
      );
    }

    const fullText = textParts.join(". ");

    // Generate TTS audio using OpenAI directly
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY environment variable is not set",
        } as ApiError,
        { status: 500 }
      );
    }

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate audio using Text-to-Speech API
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1",
      input: fullText,
      voice: "echo",
      response_format: "mp3",
    });

    // Convert the response stream to a buffer
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    // Generate filename: location-{locationId}-{languageCode}.mp3
    const filename = `location-${locationId}-${languageCode}.mp3`;

    // Upload audio to Vercel Blob Storage
    const audioUrl = await uploadAudioToBlob(audioBuffer, filename);

    // Delete existing audio block at position 99 for this location and language if it exists
    const existingAudioBlock = await sql`
      SELECT b.block_id, b.content_id_left, b.content_id_right
      FROM blocks b
      INNER JOIN contents c1 ON b.content_id_left = c1.content_id AND c1.language_id = ${languageId}
      WHERE b.location_id = ${locationId} AND b.position = 99
    `;

    if (existingAudioBlock.length > 0) {
      const block = existingAudioBlock[0];
      // Delete the block
      await sql`
        DELETE FROM blocks WHERE block_id = ${block.block_id}
      `;
      // Delete the associated contents
      if (block.content_id_left) {
        await sql`
          DELETE FROM contents WHERE content_id = ${block.content_id_left}
        `;
      }
      if (block.content_id_right) {
        await sql`
          DELETE FROM contents WHERE content_id = ${block.content_id_right}
        `;
      }
    }

    // Create audio content (left) - store the audio URL
    const audioContentLeftResult = await sql`
      INSERT INTO contents (content, is_url, language_id)
      VALUES (${audioUrl}, true, ${languageId})
      RETURNING content_id
    `;
    const audioContentLeftId = audioContentLeftResult[0].content_id;

    // Create dummy audio content (right) to satisfy constraint
    const audioContentRightResult = await sql`
      INSERT INTO contents (content, is_url, language_id)
      VALUES ('', false, ${languageId})
      RETURNING content_id
    `;
    const audioContentRightId = audioContentRightResult[0].content_id;

    // Create audio block at position 99
    await sql`
      INSERT INTO blocks (content_id_left, content_id_right, location_id, position)
      VALUES (${audioContentLeftId}, ${audioContentRightId}, ${locationId}, 99)
    `;

    return NextResponse.json({
      success: true,
      data: { audioUrl },
    } as ApiResponse<{ audioUrl: string }>);
  } catch (error) {
    console.error("Error generating TTS audio:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate TTS audio: ${error instanceof Error ? error.message : "Unknown error"}`,
      } as ApiError,
      { status: 500 }
    );
  }
}

