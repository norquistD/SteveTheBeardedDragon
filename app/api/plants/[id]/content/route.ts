import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ApiResponse, ApiError } from "@/lib/types";

interface PlantPageData {
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
    const plantId = parseInt(params.id);
    if (isNaN(plantId)) {
      return NextResponse.json(
        { success: false, error: "Invalid plant ID" } as ApiError,
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

    // Query to get all plant blocks with their content
    // Filter to only get blocks where both left and right content match the language_id
    const rows = (await sql`
      SELECT 
        pb.position,
        c1.content as left_content,
        c1.is_url as left_is_url,
        c2.content as right_content,
        c2.is_url as right_is_url
      FROM plant_blocks pb
      LEFT JOIN contents c1 ON pb.content_id_left = c1.content_id 
        AND c1.language_id = ${languageId}
      LEFT JOIN contents c2 ON pb.content_id_right = c2.content_id
        AND c2.language_id = ${languageId}
      WHERE pb.plant_id = ${plantId}
      AND (c1.content_id IS NOT NULL AND c2.content_id IS NOT NULL)
      ORDER BY pb.position NULLS FIRST
    `) as BlockRow[];

    // Extract title from the first row (position IS NULL) if it exists
    const titleRow = rows.find((row) => row.position === null);
    const title = titleRow?.left_content || "";

    // Build content array from rows where position IS NOT NULL
    const content: Block[] = rows
      .filter((row) => row.position !== null)
      .map((row) => ({
        leftType: row.left_is_url ? ("url" as const) : ("paragraph" as const),
        leftContent: row.left_content || "",
        rightType: row.right_is_url ? ("url" as const) : ("paragraph" as const),
        rightContent: row.right_content || "",
      }));

    const result: PlantPageData = {
      title,
      content,
    };

    return NextResponse.json({
      success: true,
      data: result,
    } as ApiResponse<PlantPageData>);
  } catch (error) {
    console.error("Error fetching plant content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plant content" } as ApiError,
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plantId = parseInt(params.id);
    if (isNaN(plantId)) {
      return NextResponse.json(
        { success: false, error: "Invalid plant ID" } as ApiError,
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, language_id } = body;

    if (!title || !Array.isArray(content) || !language_id) {
      return NextResponse.json(
        {
          success: false,
          error: "title, content array, and language_id are required",
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

    // Verify language exists
    const languageCheck = await sql`
      SELECT language_id FROM languages WHERE language_id = ${languageId}
    `;
    if (languageCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Language not found" } as ApiError,
        { status: 404 }
      );
    }

    // Verify plant exists
    const plantCheck = await sql`
      SELECT plant_id FROM plants WHERE plant_id = ${plantId}
    `;
    if (plantCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant not found" } as ApiError,
        { status: 404 }
      );
    }

    // Delete all existing plant blocks and their associated content for this plant and language
    // First, get all blocks for this plant
    const existingBlocks = await sql`
      SELECT block_id, content_id_left, content_id_right 
      FROM plant_blocks 
      WHERE plant_id = ${plantId}
    `;

    // Collect content IDs that need to be deleted (only for this language)
    const contentIdsToDelete: number[] = [];
    for (const block of existingBlocks) {
      if (block.content_id_left) {
        // Check if this content is for the target language
        const leftContent = await sql`
          SELECT content_id FROM contents 
          WHERE content_id = ${block.content_id_left} 
          AND language_id = ${languageId}
        `;
        if (leftContent.length > 0) {
          contentIdsToDelete.push(block.content_id_left);
        }
      }
      if (block.content_id_right) {
        // Check if this content is for the target language
        const rightContent = await sql`
          SELECT content_id FROM contents 
          WHERE content_id = ${block.content_id_right} 
          AND language_id = ${languageId}
        `;
        if (rightContent.length > 0) {
          contentIdsToDelete.push(block.content_id_right);
        }
      }
    }

    // Delete all plant blocks for this plant first (to remove foreign key constraints)
    await sql`
      DELETE FROM plant_blocks WHERE plant_id = ${plantId}
    `;

    // Then delete the contents for this language
    if (contentIdsToDelete.length > 0) {
      for (const contentId of contentIdsToDelete) {
        await sql`
          DELETE FROM contents 
          WHERE content_id = ${contentId} 
          AND language_id = ${languageId}
        `;
      }
    }

    // Create title content (left)
    const titleContentLeftResult = await sql`
      INSERT INTO contents (content, is_url, language_id)
      VALUES (${title}, false, ${languageId})
      RETURNING content_id
    `;
    const titleContentLeftId = titleContentLeftResult[0].content_id;

    // Create dummy title content (right) to satisfy constraint
    const titleContentRightResult = await sql`
      INSERT INTO contents (content, is_url, language_id)
      VALUES ('', false, ${languageId})
      RETURNING content_id
    `;
    const titleContentRightId = titleContentRightResult[0].content_id;

    // Create title block (position IS NULL)
    await sql`
      INSERT INTO plant_blocks (content_id_left, content_id_right, plant_id, position)
      VALUES (${titleContentLeftId}, ${titleContentRightId}, ${plantId}, NULL)
    `;

    // Create content blocks
    for (let i = 0; i < content.length; i++) {
      const block = content[i] as Block;

      // Create left content
      const leftContentResult = await sql`
        INSERT INTO contents (content, is_url, language_id)
        VALUES (${block.leftContent}, ${block.leftType === "url"}, ${languageId})
        RETURNING content_id
      `;
      const leftContentId = leftContentResult[0].content_id;

      // Create right content
      const rightContentResult = await sql`
        INSERT INTO contents (content, is_url, language_id)
        VALUES (${block.rightContent}, ${block.rightType === "url"}, ${languageId})
        RETURNING content_id
      `;
      const rightContentId = rightContentResult[0].content_id;

      // Create block with position
      await sql`
        INSERT INTO plant_blocks (content_id_left, content_id_right, plant_id, position)
        VALUES (${leftContentId}, ${rightContentId}, ${plantId}, ${i + 1})
      `;
    }

    return NextResponse.json(
      {
        success: true,
        data: { message: "Content created successfully" },
      } as ApiResponse<{ message: string }>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating plant content:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create plant content: ${error instanceof Error ? error.message : "Unknown error"}`,
      } as ApiError,
      { status: 500 }
    );
  }
}

