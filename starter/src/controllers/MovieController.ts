import type { MovieRepository } from "../Infrastructure/MovieRepository";
import { z } from "zod";

const MovieIdSchema = z.string().uuid();

export async function getAllMovies(movies: MovieRepository) {
  return await movies.getAllMovies();
}

export async function getMovieById(movies: MovieRepository, id: string) {
  if (!MovieIdSchema.safeParse(id).success)
    return { error: "Invalid movie id", status: 400 };
  const movie = await movies.getMovieById(id);
  if (!movie) return { error: "Movie not found", status: 404 };
  return { movie, status: 200 };
}

export async function createMovie(movies: MovieRepository, data: any) {
  await movies.createMovie(data);
  return { status: 201 };
}

export async function updateMovie(
  movies: MovieRepository,
  id: string,
  data: any,
) {
  if (!MovieIdSchema.safeParse(id).success)
    return { error: "Invalid movie id", status: 400 };
  await movies.updateMovie(id, data);
  return { status: 200 };
}

export async function patchMovie(
  movies: MovieRepository,
  id: string,
  data: any,
) {
  if (!MovieIdSchema.safeParse(id).success)
    return { error: "Invalid movie id", status: 400 };
  await movies.patchMovie(id, data);
  return { status: 200 };
}

export async function deleteMovie(movies: MovieRepository, id: string) {
  if (!MovieIdSchema.safeParse(id).success)
    return { error: "Invalid movie id", status: 400 };
  await movies.deleteMovie(id);
  return { status: 200 };
}
