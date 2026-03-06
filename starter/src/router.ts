import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Pool } from "pg";
import type { MovieRepository } from "./Infrastructure/MovieRepository.js";
import type { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";

const MovieIdSchema = z.coerce.number().int().positive();

type RouterDeps = {
  pool: Pool;
  movies: MovieRepository;
  screenings: ScreeningRepository;
};

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, status, { ok: false, error: message });
}

export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  deps: RouterDeps,
): Promise<void> {
  const { movies, screenings } = deps;
  const method = req.method ?? "";
  const [path] = (req.url ?? "/").split("?", 2);
  const segments = (path ?? "/").split("/").filter(Boolean);

  // GET /health
  if (method === "GET" && path === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  // GET /movies
  if (method === "GET" && path === "/movies") {
    try {
      const items = await movies.getAllMovies();
      return sendJson(res, 200, { ok: true, items });
    } catch (error) {
      console.error("Error fetching movies:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  // GET /movies/:id/screenings
  // Alias optionnel: GET /movies/:id/seances
  if (
    method === "GET" &&
    segments.length === 3 &&
    segments[0] === "movies" &&
    (segments[2] === "screenings" || segments[2] === "seances")
  ) {
    const parsedMovieId = MovieIdSchema.safeParse(segments[1]);
    if (!parsedMovieId.success) {
      return sendError(res, 400, "Invalid movie id");
    }

    const movieId = parsedMovieId.data;
    try {
      const items = await screenings.listByMovieId(movieId);
      return sendJson(res, 200, { ok: true, items });
    } catch (error) {
      console.error(
        `Error fetching screenings for movie id ${movieId}:`,
        error,
      );
      return sendError(res, 500, "Internal server error");
    }
  }

  // 404
  return sendError(res, 404, "Not found");
}
