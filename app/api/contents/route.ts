import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Content, Language, ApiResponse, ApiError } from "@/lib/types";
import { createContentSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get("language_id");

    let contents: Content[];
    if (languageId) {
      const languageIdNum = parseInt(languageId);
      if (isNaN(languageIdNum)) {
        return NextResponse.json(
          { success: false, error: "Invalid language_id" } as ApiError,
          { status: 400 },
        );
      }
      contents = await sql`
        SELECT content_id, content, is_url, language_id 
        FROM contents 
        WHERE language_id = ${languageIdNum} 
        ORDER BY content_id
      ` as Content[];
    } else {
      contents = await sql`
        SELECT content_id, content, is_url, language_id 
        FROM contents 
        ORDER BY content_id
      ` as Content[];
    }

    return NextResponse.json({ success: true, data: contents } as ApiResponse<
      Content[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch contents" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createContentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { content, is_url, language_id } = validationResult.data;

    // Validate language_id exists
    const languageCheck =
      await sql`SELECT language_id FROM languages WHERE language_id = ${language_id}` as Language[];
    if (languageCheck?.length === 0) {
      return NextResponse.json(
        { success: false, error: "Language not found" } as ApiError,
        { status: 404 },
      );
    }

    const result = await sql`
      INSERT INTO contents (content, is_url, language_id)
      VALUES (${content}, ${is_url}, ${language_id})
      RETURNING content_id, content, is_url, language_id
    ` as Content[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Content>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create content" } as ApiError,
      { status: 500 },
    );
  }
}
