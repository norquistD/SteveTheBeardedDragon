import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Language, Content, ApiResponse, ApiError } from "@/lib/types";
import { updateLanguageSchema } from "@/lib/schemas";

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
      SELECT language_id, language_code, language_name, language_native_name 
      FROM languages 
      WHERE language_id = ${id}
    ` as Language[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Language not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Language>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch language" } as ApiError,
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
    const validationResult = updateLanguageSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { language_code, language_name, language_native_name } =
      validationResult.data;

    // Helper function to escape SQL strings
    const escapeSqlString = (value: string): string => {
      return "'" + value.replace(/'/g, "''") + "'";
    };

    const updates: string[] = [];

    if (language_code !== undefined) {
      updates.push(`language_code = ${escapeSqlString(language_code)}`);
    }
    if (language_name !== undefined) {
      updates.push(`language_name = ${escapeSqlString(language_name)}`);
    }
    if (language_native_name !== undefined) {
      updates.push(`language_native_name = ${escapeSqlString(language_native_name)}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 },
      );
    }

    const query = `
      UPDATE languages 
      SET ${updates.join(", ")}
      WHERE language_id = ${id}
      RETURNING language_id, language_code, language_name, language_native_name
    `;
    
    const result = (await sql(query)) as Language[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Language not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Language>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update language" } as ApiError,
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

    // Check for existing contents
    const contents =
      await sql`SELECT content_id FROM contents WHERE language_id = ${id}` as Content[];
    if (contents.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete language with existing contents",
        } as ApiError,
        { status: 409 },
      );
    }

    const result =
      await sql`DELETE FROM languages WHERE language_id = ${id} RETURNING language_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Language not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].language_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete language" } as ApiError,
      { status: 500 },
    );
  }
}
