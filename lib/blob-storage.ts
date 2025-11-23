import { put } from "@vercel/blob";

/**
 * Uploads an audio buffer to Vercel Blob Storage
 * @param buffer - The audio file buffer to upload
 * @param filename - The filename for the blob (e.g., "plant-123-en.mp3")
 * @returns The full blob URL
 * @throws Error if STEVE_READ_WRITE_TOKEN is not set or upload fails
 */
export async function uploadAudioToBlob(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (!process.env.STEVE_READ_WRITE_TOKEN) {
    throw new Error("STEVE_READ_WRITE_TOKEN environment variable is not set");
  }

  try {
    // Buffer extends Uint8Array which should be compatible with PutBody
    // Using type assertion to work around strict TypeScript types
    // @ts-expect-error - Buffer is compatible with PutBody at runtime but TypeScript types are strict
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "audio/mpeg",
      token: process.env.STEVE_READ_WRITE_TOKEN,
    });

    return blob.url;
  } catch (error) {
    throw new Error(
      `Failed to upload audio to blob storage: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

