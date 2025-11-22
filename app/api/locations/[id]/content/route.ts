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

    // Delete all existing blocks and their associated content for this location and language
    const existingBlocks = await sql`
      SELECT block_id, content_id_left, content_id_right 
      FROM blocks 
      WHERE location_id = ${locationId}
    `;

    for (const block of existingBlocks) {
      // Delete the content entries for this language only
      if (block.content_id_left) {
        await sql`
          DELETE FROM contents 
          WHERE content_id = ${block.content_id_left} 
          AND language_id = ${languageId}
        `;
      }
      if (block.content_id_right) {
        await sql`
          DELETE FROM contents 
          WHERE content_id = ${block.content_id_right} 
          AND language_id = ${languageId}
        `;
      }
    }

    // Delete all blocks for this location
    await sql`
      DELETE FROM blocks WHERE location_id = ${locationId}
    `;

    // Create title content
    const titleContentResult = await sql`
      INSERT INTO contents (content, is_url, language_id)
      VALUES (${title}, false, ${languageId})
      RETURNING content_id
    `;
    const titleContentId = titleContentResult[0].content_id;

    // Create title block (position IS NULL)
    await sql`
      INSERT INTO blocks (content_id_left, content_id_right, location_id, position)
      VALUES (${titleContentId}, NULL, ${locationId}, NULL)
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
        INSERT INTO blocks (content_id_left, content_id_right, location_id, position)
        VALUES (${leftContentId}, ${rightContentId}, ${locationId}, ${i + 1})
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
    console.error("Error creating location content:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create location content: ${error instanceof Error ? error.message : "Unknown error"}`,
      } as ApiError,
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title, content, language_id } = body;

    if (title === undefined || !Array.isArray(content) || !language_id) {
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

    // Get existing blocks for this location
    const existingBlocks = await sql`
      SELECT block_id, content_id_left, content_id_right, position
      FROM blocks 
      WHERE location_id = ${locationId}
      ORDER BY position NULLS FIRST
    `;

    // Handle title block (position = NULL)
    const titleBlock = existingBlocks.find((b) => b.position === null);

    if (titleBlock) {
      // Update existing title content
      if (titleBlock.content_id_left) {
        await sql`
          UPDATE contents
          SET content = ${title}, is_url = false, language_id = ${languageId}
          WHERE content_id = ${titleBlock.content_id_left}
        `;
      } else {
        // Create new title content and update block
        const titleContentResult = await sql`
          INSERT INTO contents (content, is_url, language_id)
          VALUES (${title}, false, ${languageId})
          RETURNING content_id
        `;
        await sql`
          UPDATE blocks
          SET content_id_left = ${titleContentResult[0].content_id}
          WHERE block_id = ${titleBlock.block_id}
        `;
      }
    } else {
      // Create new title content and block
      const titleContentResult = await sql`
        INSERT INTO contents (content, is_url, language_id)
        VALUES (${title}, false, ${languageId})
        RETURNING content_id
      `;
      await sql`
        INSERT INTO blocks (content_id_left, content_id_right, location_id, position)
        VALUES (${titleContentResult[0].content_id}, NULL, ${locationId}, NULL)
      `;
    }

    // Handle content blocks
    const contentBlocks = existingBlocks.filter((b) => b.position !== null);

    // Update or create content blocks
    for (let i = 0; i < content.length; i++) {
      const block = content[i] as Block;
      const existingBlock = contentBlocks[i];

      if (existingBlock) {
        // Update existing block's content
        if (existingBlock.content_id_left) {
          await sql`
            UPDATE contents
            SET content = ${block.leftContent}, is_url = ${block.leftType === "url"}, language_id = ${languageId}
            WHERE content_id = ${existingBlock.content_id_left}
          `;
        } else {
          // Create new left content
          const leftContentResult = await sql`
            INSERT INTO contents (content, is_url, language_id)
            VALUES (${block.leftContent}, ${block.leftType === "url"}, ${languageId})
            RETURNING content_id
          `;
          await sql`
            UPDATE blocks
            SET content_id_left = ${leftContentResult[0].content_id}
            WHERE block_id = ${existingBlock.block_id}
          `;
        }

        if (existingBlock.content_id_right) {
          await sql`
            UPDATE contents
            SET content = ${block.rightContent}, is_url = ${block.rightType === "url"}, language_id = ${languageId}
            WHERE content_id = ${existingBlock.content_id_right}
          `;
        } else {
          // Create new right content
          const rightContentResult = await sql`
            INSERT INTO contents (content, is_url, language_id)
            VALUES (${block.rightContent}, ${block.rightType === "url"}, ${languageId})
            RETURNING content_id
          `;
          await sql`
            UPDATE blocks
            SET content_id_right = ${rightContentResult[0].content_id}
            WHERE block_id = ${existingBlock.block_id}
          `;
        }
      } else {
        // Create new block with new content
        const leftContentResult = await sql`
          INSERT INTO contents (content, is_url, language_id)
          VALUES (${block.leftContent}, ${block.leftType === "url"}, ${languageId})
          RETURNING content_id
        `;
        const rightContentResult = await sql`
          INSERT INTO contents (content, is_url, language_id)
          VALUES (${block.rightContent}, ${block.rightType === "url"}, ${languageId})
          RETURNING content_id
        `;
        await sql`
          INSERT INTO blocks (content_id_left, content_id_right, location_id, position)
          VALUES (${leftContentResult[0].content_id}, ${rightContentResult[0].content_id}, ${locationId}, ${i + 1})
        `;
      }
    }

    // Delete extra blocks if content array is shorter than existing blocks
    if (content.length < contentBlocks.length) {
      for (let i = content.length; i < contentBlocks.length; i++) {
        const blockToDelete = contentBlocks[i];
        await sql`
          DELETE FROM blocks WHERE block_id = ${blockToDelete.block_id}
        `;
        // Note: Content entries will remain for potential reuse or can be cleaned up separately
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { message: "Content updated successfully" },
      } as ApiResponse<{ message: string }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating location content:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update location content: ${error instanceof Error ? error.message : "Unknown error"}`,
      } as ApiError,
      { status: 500 }
    );
  }
}
