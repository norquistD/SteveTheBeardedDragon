import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Dome, ApiResponse, ApiError } from "@/lib/types";
import { createDomeSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const domes = await sql`
      SELECT dome_id, dome_name, dome_image_url, dome_path_image_url 
      FROM domes 
      ORDER BY dome_id
    ` as Dome[];
    return NextResponse.json({ success: true, data: domes } as ApiResponse<
      Dome[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch domes" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createDomeSchema.safeParse(body);

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

    const result = await sql`
      INSERT INTO domes (dome_name, dome_image_url, dome_path_image_url)
      VALUES (${dome_name}, ${dome_image_url}, ${dome_path_image_url})
      RETURNING dome_id, dome_name, dome_image_url, dome_path_image_url
    ` as Dome[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Dome>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create dome" } as ApiError,
      { status: 500 },
    );
  }
}
