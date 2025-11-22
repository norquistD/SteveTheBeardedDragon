import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Block, ApiResponse, ApiError } from "@/lib/types";
import { createBlockSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    let blocks: Block[];
    if (locationId) {
      const locationIdNum = parseInt(locationId);
      if (isNaN(locationIdNum)) {
        return NextResponse.json(
          { success: false, error: "Invalid location_id" } as ApiError,
          { status: 400 },
        );
      }
      blocks = await sql`
        SELECT block_id, content_id_left, content_id_right, location_id, position 
        FROM blocks 
        WHERE location_id = ${locationIdNum} 
        ORDER BY block_id
      ` as Block[];
    } else {
      blocks = await sql`
        SELECT block_id, content_id_left, content_id_right, location_id, position 
        FROM blocks 
        ORDER BY block_id
      ` as Block[];
    }

    return NextResponse.json({ success: true, data: blocks } as ApiResponse<
      Block[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch blocks" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createBlockSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { content_id_left, content_id_right, location_id, position } =
      validationResult.data;

    // Validate location_id exists
    const locationCheck =
      await sql`SELECT location_id FROM locations WHERE location_id = ${location_id}`;
    if (locationCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" } as ApiError,
        { status: 404 },
      );
    }

    const result = await sql`
      INSERT INTO blocks (content_id_left, content_id_right, location_id, position)
      VALUES (${content_id_left ?? null}, ${content_id_right ?? null}, ${location_id}, ${position ?? null})
      RETURNING block_id, content_id_left, content_id_right, location_id, position
    ` as Block[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Block>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create block" } as ApiError,
      { status: 500 },
    );
  }
}
