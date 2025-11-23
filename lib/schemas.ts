import { z } from "zod";

// Dome Schemas
export const createDomeSchema = z.object({
  dome_name: z.string().max(255),
  dome_image_url: z.string(),
});

export const updateDomeSchema = z.object({
  dome_name: z.string().max(255).optional(),
  dome_image_url: z.string().optional(),
});

// Tour Schemas
export const createTourSchema = z.object({
  tour_name: z.string().max(255),
  tour_description: z.string(),
  tour_path_image_url: z.string(),
});

export const updateTourSchema = z.object({
  tour_name: z.string().max(255).optional(),
  tour_description: z.string().optional(),
  tour_path_image_url: z.string().optional(),
});

// Location Schemas
export const createLocationSchema = z.object({
  tour_id: z.number().int().positive(),
  location_name: z.string().max(255),
  location_label: z.string().max(255),
  position_x: z.number().min(0).max(1),
  position_y: z.number().min(0).max(1),
});

export const updateLocationSchema = z.object({
  tour_id: z.number().int().positive().optional(),
  location_name: z.string().max(255).optional(),
  location_label: z.string().max(255).optional(),
  position_x: z.number().min(0).max(1).optional(),
  position_y: z.number().min(0).max(1).optional(),
});

// Language Schemas
export const createLanguageSchema = z.object({
  language_code: z.string().max(3),
  language_name: z.string(),
  language_native_name: z.string(),
});

export const updateLanguageSchema = z.object({
  language_code: z.string().max(3).optional(),
  language_name: z.string().optional(),
  language_native_name: z.string().optional(),
});

// Content Schemas
export const createContentSchema = z.object({
  content: z.string(),
  is_url: z.boolean(),
  language_id: z.number().int().positive(),
});

export const updateContentSchema = z.object({
  content: z.string().optional(),
  is_url: z.boolean().optional(),
  language_id: z.number().int().positive().optional(),
});

// Block Schemas
export const createBlockSchema = z.object({
  content_id_left: z.number().int().positive().nullable().optional(),
  content_id_right: z.number().int().positive().nullable().optional(),
  location_id: z.number().int().positive(),
  position: z.number().int().min(0).max(99).nullable().optional(),
});

export const updateBlockSchema = z.object({
  content_id_left: z.number().int().positive().nullable().optional(),
  content_id_right: z.number().int().positive().nullable().optional(),
  location_id: z.number().int().positive().optional(),
  position: z.number().int().min(0).max(99).nullable().optional(),
});

// Audio Generation Schemas
// Note: TTS API supports mp3, opus, aac, flac. Wav is converted to mp3.
export const generateAudioSchema = z.object({
  prompt: z.string().min(1),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .optional()
    .default("alloy"),
  format: z
    .enum(["wav", "mp3", "opus", "aac", "flac"])
    .optional()
    .default("mp3"),
});

// Translation Schemas
export const translateSchema = z.object({
  text: z.string().min(1),
  source_language: z.string().min(1),
  target_language: z.string().min(1),
});

// Moderation Schemas
export const moderateSchema = z.object({
  input: z.string().min(1),
});

// Plant Schemas
export const createPlantSchema = z.object({
  plant_name: z.string().max(255),
  plant_scientific_name: z.string().max(255),
});

export const updatePlantSchema = z.object({
  plant_name: z.string().max(255).optional(),
  plant_scientific_name: z.string().max(255).optional(),
});

// Plant Block Schemas
export const createPlantBlockSchema = z.object({
  content_id_left: z.number().int().positive().nullable().optional(),
  content_id_right: z.number().int().positive().nullable().optional(),
  plant_id: z.number().int().positive(),
  position: z.number().int().min(0).max(99).nullable().optional(),
});

export const updatePlantBlockSchema = z.object({
  content_id_left: z.number().int().positive().nullable().optional(),
  content_id_right: z.number().int().positive().nullable().optional(),
  plant_id: z.number().int().positive().optional(),
  position: z.number().int().min(0).max(99).nullable().optional(),
});

// Web Search Schema (no request body needed, plant_id comes from route)
export const webSearchSchema = z.object({});