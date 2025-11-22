import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ApiResponse, ApiError } from "@/lib/types";

interface InfoPageData {
  title: string;
  content: Block[];
}

interface Block {
  leftType: "paragraph" | "url";
  leftContent: string;
  rightType: "paragraph" | "url";
  rightContent: string;
}

interface BlockRow {
  position: number | null;
  left_content: string | null;
  left_is_url: boolean | null;
  right_content: string | null;
  right_is_url: boolean | null;
}

export async function GET(
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

    const { searchParams } = new URL(request.url);
    const languageIdParam = searchParams.get("language_id");

    if (!languageIdParam) {
      return NextResponse.json(
        {
          success: false,
          error: "language_id query parameter is required",
        } as ApiError,
        { status: 400 }
      );
    }

    const languageId = parseInt(languageIdParam);
    if (isNaN(languageId)) {
      return NextResponse.json(
        { success: false, error: "Invalid language_id" } as ApiError,
        { status: 400 }
      );
    }

    // Query to get all blocks with their content
    const rows = (await sql`
      SELECT 
        b.position,
        c1.content as left_content,
        c1.is_url as left_is_url,
        c2.content as right_content,
        c2.is_url as right_is_url
      FROM blocks b
      LEFT JOIN contents c1 ON b.content_id_left = c1.content_id 
        AND (c1.is_url = true OR c1.language_id = ${languageId})
      LEFT JOIN contents c2 ON b.content_id_right = c2.content_id
        AND (c2.is_url = true OR c2.language_id = ${languageId})
      WHERE b.location_id = ${locationId}
      ORDER BY b.position NULLS FIRST
    `) as BlockRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No content found for this location",
        } as ApiError,
        { status: 404 }
      );
    }

    // Extract title from the first row (position IS NULL)
    const titleRow = rows.find((row) => row.position === null);
    if (!titleRow || !titleRow.left_content) {
      return NextResponse.json(
        {
          success: false,
          error: "Title not found for this location",
        } as ApiError,
        { status: 404 }
      );
    }

    const title = titleRow.left_content;

    // Build content array from rows where position IS NOT NULL
    const content: Block[] = rows
      .filter((row) => row.position !== null)
      .map((row) => ({
        leftType: row.left_is_url ? ("url" as const) : ("paragraph" as const),
        leftContent: row.left_content || "",
        rightType: row.right_is_url ? ("url" as const) : ("paragraph" as const),
        rightContent: row.right_content || "",
      }));

    const result: InfoPageData = {
      title,
      content,
    };

    return NextResponse.json({
      success: true,
      data: result,
    } as ApiResponse<InfoPageData>);
  } catch (error) {
    console.error("Error fetching location content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch location content" } as ApiError,
      { status: 500 }
    );
  }
}
