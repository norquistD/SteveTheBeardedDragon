import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Tour, Location, ApiResponse, ApiError } from "@/lib/types";
import { updateTourSchema } from "@/lib/schemas";

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
      SELECT tour_id, tour_name, tour_description, tour_path_image_url 
      FROM tours 
      WHERE tour_id = ${id}
    ` as Tour[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tour not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Tour>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tour" } as ApiError,
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
    const validationResult = updateTourSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { tour_name, tour_description, tour_path_image_url } =
      validationResult.data;

    // Helper function to escape SQL strings
    const escapeSqlString = (value: string): string => {
      return "'" + value.replace(/'/g, "''") + "'";
    };

    const updates: string[] = [];

    if (tour_name !== undefined) {
      updates.push(`tour_name = ${escapeSqlString(tour_name)}`);
    }
    if (tour_description !== undefined) {
      updates.push(`tour_description = ${escapeSqlString(tour_description)}`);
    }
    if (tour_path_image_url !== undefined) {
      updates.push(`tour_path_image_url = ${escapeSqlString(tour_path_image_url)}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 },
      );
    }

    const query = `
      UPDATE tours 
      SET ${updates.join(", ")}
      WHERE tour_id = ${id}
      RETURNING tour_id, tour_name, tour_description, tour_path_image_url
    `;
    
    const result = (await sql(query)) as Tour[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tour not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Tour>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update tour" } as ApiError,
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
      await sql`SELECT location_id FROM locations WHERE tour_id = ${id}` as Location[];
    if (locations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete tour with existing locations",
        } as ApiError,
        { status: 409 },
      );
    }

    const result =
      await sql`DELETE FROM tours WHERE tour_id = ${id} RETURNING tour_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tour not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].tour_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete tour" } as ApiError,
      { status: 500 },
    );
  }
}

