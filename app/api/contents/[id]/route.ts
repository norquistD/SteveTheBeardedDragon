import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Content, Language, ApiResponse, ApiError } from "@/lib/types";
import { updateContentSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" } as ApiError,
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT content_id, content, is_url, language_id 
      FROM contents 
      WHERE content_id = ${id}
    ` as Content[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Content>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch content" } as ApiError,
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" } as ApiError,
        { status: 400 },
      );
    }

    const body = await request.json();
    const validationResult = updateContentSchema.safeParse(body);

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

    // Validate language_id if provided
    if (language_id !== undefined) {
      const languageCheck =
        await sql`SELECT language_id FROM languages WHERE language_id = ${language_id}` as Language[];
      if (languageCheck?.length === 0) {
        return NextResponse.json(
          { success: false, error: "Language not found" } as ApiError,
          { status: 404 },
        );
      }
    }

    // Helper function to escape SQL strings
    const escapeSqlString = (value: string): string => {
      return "'" + value.replace(/'/g, "''") + "'";
    };

    const updates: string[] = [];

    if (content !== undefined) {
      updates.push(`content = ${escapeSqlString(content)}`);
    }
    if (is_url !== undefined) {
      updates.push(`is_url = ${is_url}`);
    }
    if (language_id !== undefined) {
      updates.push(`language_id = ${language_id}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 },
      );
    }

    const query = `
      UPDATE contents 
      SET ${updates.join(", ")}
      WHERE content_id = ${id}
      RETURNING content_id, content, is_url, language_id
    `;
    
    const result = (await sql(query)) as Content[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Content>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update content" } as ApiError,
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" } as ApiError,
        { status: 400 },
      );
    }

    // Check for existing blocks referencing this content
    const blocks = await sql`
      SELECT block_id FROM blocks 
      WHERE content_id_left = ${id} OR content_id_right = ${id}
    `;
    if (blocks.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete content referenced by blocks",
        } as ApiError,
        { status: 409 },
      );
    }

    const result =
      await sql`DELETE FROM contents WHERE content_id = ${id} RETURNING content_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].content_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete content" } as ApiError,
      { status: 500 },
    );
  }
}
