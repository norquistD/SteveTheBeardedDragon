import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { PlantBlock, ApiResponse, ApiError } from "@/lib/types";
import { updatePlantBlockSchema } from "@/lib/schemas";

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
      SELECT block_id, content_id_left, content_id_right, plant_id, position 
      FROM plant_blocks 
      WHERE block_id = ${id}
    ` as PlantBlock[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant block not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<PlantBlock>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch plant block" } as ApiError,
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
    const validationResult = updatePlantBlockSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { content_id_left, content_id_right, plant_id, position } =
      validationResult.data;

    // Get current plant block to merge with updates
    const currentPlantBlock = await sql`
      SELECT block_id, content_id_left, content_id_right, plant_id, position 
      FROM plant_blocks 
      WHERE block_id = ${id}
    ` as PlantBlock[];

    if (currentPlantBlock?.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant block not found" } as ApiError,
        { status: 404 },
      );
    }

    // Merge current values with updates for constraint validation
    const finalContentIdLeft =
      content_id_left !== undefined
        ? content_id_left
        : currentPlantBlock[0].content_id_left;
    const finalContentIdRight =
      content_id_right !== undefined
        ? content_id_right
        : currentPlantBlock[0].content_id_right;
    const finalPosition =
      position !== undefined ? position : currentPlantBlock[0].position;

    // Validate position constraint with merged values
    if (finalPosition === null || finalPosition === undefined) {
      if (!finalContentIdLeft || !finalContentIdRight) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Position NULL requires both content_id_left and content_id_right",
          } as ApiError,
          { status: 400 },
        );
      }
    } else {
      if (!finalContentIdLeft && !finalContentIdRight) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Position requires at least one of content_id_left or content_id_right",
          } as ApiError,
          { status: 400 },
        );
      }
    }

    // Validate plant_id if provided
    if (plant_id !== undefined) {
      const plantCheck =
        await sql`SELECT plant_id FROM plants WHERE plant_id = ${plant_id}`;
      if (plantCheck.length === 0) {
        return NextResponse.json(
          { success: false, error: "Plant not found" } as ApiError,
          { status: 404 },
        );
      }
    }

    const updates: string[] = [];

    if (content_id_left !== undefined) {
      updates.push(`content_id_left = ${content_id_left ?? null}`);
    }
    if (content_id_right !== undefined) {
      updates.push(`content_id_right = ${content_id_right ?? null}`);
    }
    if (plant_id !== undefined) {
      updates.push(`plant_id = ${plant_id}`);
    }
    if (position !== undefined) {
      updates.push(`position = ${position ?? null}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" } as ApiError,
        { status: 400 },
      );
    }

    const query = `
      UPDATE plant_blocks 
      SET ${updates.join(", ")}
      WHERE block_id = ${id}
      RETURNING block_id, content_id_left, content_id_right, plant_id, position
    `;
    
    const result = (await sql(query)) as PlantBlock[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant block not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    } as ApiResponse<PlantBlock>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update plant block" } as ApiError,
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

    const result =
      await sql`DELETE FROM plant_blocks WHERE block_id = ${id} RETURNING block_id`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant block not found" } as ApiError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: result[0].block_id },
    } as ApiResponse<{ id: number }>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete plant block" } as ApiError,
      { status: 500 },
    );
  }
}

