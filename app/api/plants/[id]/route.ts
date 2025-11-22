import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Plant, ApiResponse, ApiError } from "@/lib/types";
import { updatePlantSchema } from "@/lib/schemas";

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
      SELECT plant_id, plant_name, plant_scientific_name 
      FROM plants 
      WHERE plant_id = ${id}
    ` as Plant[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Plant>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch plant" } as ApiError,
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
    const validationResult = updatePlantSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { plant_name, plant_scientific_name } = validationResult.data;

    // Helper function to escape SQL strings
    const escapeSqlString = (value: string): string => {
      return "'" + value.replace(/'/g, "''") + "'";
    };

    const updates: string[] = [];

    if (plant_name !== undefined) {
      updates.push(`plant_name = ${escapeSqlString(plant_name)}`);
    }
    if (plant_scientific_name !== undefined) {
      updates.push(`plant_scientific_name = ${escapeSqlString(plant_scientific_name)}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 },
      );
    }

    const query = `
      UPDATE plants 
      SET ${updates.join(", ")}
      WHERE plant_id = ${id}
      RETURNING plant_id, plant_name, plant_scientific_name
    `;
    
    const result = (await sql(query)) as Plant[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<Plant>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update plant" } as ApiError,
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

    // Check for existing plant_blocks
    const plantBlocks =
      await sql`SELECT block_id FROM plant_blocks WHERE plant_id = ${id}`;
    if (plantBlocks.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete plant with existing plant blocks",
        } as ApiError,
        { status: 409 },
      );
    }

    const result =
      await sql`DELETE FROM plants WHERE plant_id = ${id} RETURNING plant_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].plant_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete plant" } as ApiError,
      { status: 500 },
    );
  }
}

