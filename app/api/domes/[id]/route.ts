import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Dome, Location, ApiResponse, ApiError } from "@/lib/types";
import { updateDomeSchema } from "@/lib/schemas";

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
      SELECT dome_id, dome_name, dome_image_url, dome_path_image_url 
      FROM domes 
      WHERE dome_id = ${id}
    ` as Dome[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dome not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Dome>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch dome" } as ApiError,
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
    const validationResult = updateDomeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { dome_name, dome_image_url, dome_path_image_url } =
      validationResult.data;

    // Helper function to escape SQL strings
    const escapeSqlString = (value: string): string => {
      return "'" + value.replace(/'/g, "''") + "'";
    };

    const updates: string[] = [];

    if (dome_name !== undefined) {
      updates.push(`dome_name = ${escapeSqlString(dome_name)}`);
    }
    if (dome_image_url !== undefined) {
      updates.push(`dome_image_url = ${escapeSqlString(dome_image_url)}`);
    }
    if (dome_path_image_url !== undefined) {
      updates.push(`dome_path_image_url = ${escapeSqlString(dome_path_image_url)}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 },
      );
    }

    const query = `
      UPDATE domes 
      SET ${updates.join(", ")}
      WHERE dome_id = ${id}
      RETURNING dome_id, dome_name, dome_image_url, dome_path_image_url
    `;
    
    const result = (await sql(query)) as Dome[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dome not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Dome>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update dome" } as ApiError,
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

    // Check for existing locations
    const locations =
      await sql`SELECT location_id FROM locations WHERE dome_id = ${id}` as Location[];
    if (locations?.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete dome with existing locations",
        } as ApiError,
        { status: 409 },
      );
    }

    const result =
      await sql`DELETE FROM domes WHERE dome_id = ${id} RETURNING dome_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dome not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].dome_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete dome" } as ApiError,
      { status: 500 },
    );
  }
}
