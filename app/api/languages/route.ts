import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Language, ApiResponse, ApiError } from "@/lib/types";
import { createLanguageSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const languages = await sql`
      SELECT language_id, language_code, language_name, language_native_name 
      FROM languages 
      ORDER BY language_id
    ` as Language[];
    return NextResponse.json({ success: true, data: languages } as ApiResponse<
      Language[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch languages" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createLanguageSchema.safeParse(body);

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

    const result = await sql`
      INSERT INTO languages (language_code, language_name, language_native_name)
      VALUES (${language_code}, ${language_name}, ${language_native_name})
      RETURNING language_id, language_code, language_name, language_native_name
    ` as Language[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Language>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create language" } as ApiError,
      { status: 500 },
    );
  }
}
