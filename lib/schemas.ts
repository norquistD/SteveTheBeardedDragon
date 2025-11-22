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
});

export const updateLocationSchema = z.object({
  tour_id: z.number().int().positive().optional(),
  location_name: z.string().max(255).optional(),
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
export const createBlockSchema = z
  .object({
    content_id_left: z.number().int().positive().nullable().optional(),
    content_id_right: z.number().int().positive().nullable().optional(),
    location_id: z.number().int().positive(),
    position: z.number().int().min(0).max(99).nullable().optional(),
  })
  .refine(
    (data) => {
      // If position is NULL, both content_id_left and content_id_right must be provided
      if (data.position === null || data.position === undefined) {
        return (
          data.content_id_left !== null &&
          data.content_id_left !== undefined &&
          data.content_id_right !== null &&
          data.content_id_right !== undefined
        );
      }
      // If position is NOT NULL, at least one of content_id_left or content_id_right must be provided
      return (
        (data.content_id_left !== null &&
          data.content_id_left !== undefined) ||
        (data.content_id_right !== null && data.content_id_right !== undefined)
      );
    },
    {
      message:
        "Position NULL requires both content_id_left and content_id_right. Position requires at least one of content_id_left or content_id_right",
    }
  );

export const updateBlockSchema = z.object({
  content_id_left: z.number().int().positive().nullable().optional(),
  content_id_right: z.number().int().positive().nullable().optional(),
  location_id: z.number().int().positive().optional(),
  position: z.number().int().min(0).max(99).nullable().optional(),
});

