import type { ScreeningRepository } from "../Infrastructure/ScreeningRepository";
import { z } from "zod";

const MovieIdSchema = z.string().uuid();

export async function listScreeningsByMovieId(
  screenings: ScreeningRepository,
  movieId: string,
) {
  if (!MovieIdSchema.safeParse(movieId).success)
    return { error: "Invalid movie id", status: 400 };
  const items = await screenings.listScreeningsByMovieId(movieId);
  return { items, status: 200 };
}
