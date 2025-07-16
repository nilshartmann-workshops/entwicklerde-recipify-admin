import { z } from "zod/v4";

export const ImageDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  src: z.string(),
});

export type ImageDto = {
  id: string;
  title: string;
  src: string;
};
