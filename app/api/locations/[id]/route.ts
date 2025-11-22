import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Location, Block, ApiResponse, ApiError } from "@/lib/types";
import { updateLocationSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" } as ApiError,
        { status: 400 }
      );
    }

    const result = (await sql`
      SELECT location_id, tour_id, location_name, location_label, position_x, position_y 
      FROM locations 
      WHERE location_id = ${id}
    `) as Location[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" } as ApiError,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Location>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch location" } as ApiError,
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" } as ApiError,
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = updateLocationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 }
      );
    }

    const { tour_id, location_name, location_label, position_x, position_y } =
      validationResult.data;

    // Validate tour_id if provided
    if (tour_id !== undefined) {
      const tourCheck =
        await sql`SELECT tour_id FROM tours WHERE tour_id = ${tour_id}`;
      if (tourCheck.length === 0) {
        return NextResponse.json(
          { success: false, error: "Tour not found" } as ApiError,
          { status: 404 }
        );
      }
    }

    // Helper function to escape SQL strings
    const escapeSqlString = (value: string): string => {
      return "'" + value.replace(/'/g, "''") + "'";
    };

    const updates: string[] = [];

    if (tour_id !== undefined) {
      updates.push(`tour_id = ${tour_id}`);
    }
    if (location_name !== undefined) {
      updates.push(`location_name = ${escapeSqlString(location_name)}`);
    }
    if (location_label !== undefined) {
      updates.push(`location_label = ${escapeSqlString(location_label)}`);
    }
    if (position_x !== undefined) {
      updates.push(`position_x = ${position_x}`);
    }
    if (position_y !== undefined) {
      updates.push(`position_y = ${position_y}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 }
      );
    }

    const query = `
      UPDATE locations 
      SET ${updates.join(", ")}
      WHERE location_id = ${id}
      RETURNING location_id, tour_id, location_name, location_label, position_x, position_y
    `;

    const result = (await sql(query)) as Location[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" } as ApiError,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Location>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update location" } as ApiError,
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" } as ApiError,
        { status: 400 }
      );
    }

    // Check for existing blocks
    const blocks =
      (await sql`SELECT block_id FROM blocks WHERE location_id = ${id}`) as Block[];
    if (blocks.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete location with existing blocks",
        } as ApiError,
        { status: 409 }
      );
    }

    const result =
      await sql`DELETE FROM locations WHERE location_id = ${id} RETURNING location_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" } as ApiError,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].location_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete location" } as ApiError,
      { status: 500 }
    );
  }
}
