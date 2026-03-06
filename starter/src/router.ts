import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Pool } from "pg";
import type { MovieRepository } from "./Infrastructure/MovieRepository.js";
import type { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";
import * as MovieController from "./controllers/MovieController";
import * as screeningController from "./controllers/ScreeningController";
const MovieIdSchema = z.string().uuid();

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
      const items = await MovieController.getAllMovies(movies);
      return sendJson(res, 200, { ok: true, items });
    } catch (error) {
      return sendError(res, 500, "Internal server error");
    }
  }

  // GET /movies/:id
  if (method === "GET" && segments.length === 2 && segments[0] === "movies") {
    const movieId = segments[1];
    if (!movieId) return sendError(res, 400, "Movie id is required");
    const result = await MovieController.getMovieById(movies, movieId);
    if (result.error) return sendError(res, result.status, result.error);
    return sendJson(res, 200, { ok: true, item: result.movie });
  }

  // POST /movies
  if (method === "POST" && path === "/movies") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const result = await MovieController.createMovie(movies, data);
        return sendJson(res, result.status, { ok: true });
      } catch {
        return sendError(res, 400, "Invalid movie data");
      }
    });
    return;
  }

  // PUT /movies/:id
  if (method === "PUT" && segments.length === 2 && segments[0] === "movies") {
    let body = "";
    const movieId = segments[1];
    if (!movieId) return sendError(res, 400, "Movie id is required");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const result = await MovieController.updateMovie(movies, movieId, data);
        if (result.error) return sendError(res, result.status, result.error);
        return sendJson(res, result.status, { ok: true });
      } catch {
        return sendError(res, 400, "Invalid movie data");
      }
    });
    return;
  }

  // PATCH /movies/:id
  if (method === "PATCH" && segments.length === 2 && segments[0] === "movies") {
    const movieId = segments[1];
    if (!movieId) return sendError(res, 400, "Movie id is required");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const result = await MovieController.patchMovie(movies, movieId, data);
        if (result.error) return sendError(res, result.status, result.error);
        return sendJson(res, result.status, { ok: true });
      } catch {
        return sendError(res, 400, "Invalid movie data");
      }
    });
    return;
  }

  // DELETE /movies/:id
  if (
    method === "DELETE" &&
    segments.length === 2 &&
    segments[0] === "movies"
  ) {
    const movieId = segments[1];
    if (!movieId) return sendError(res, 400, "Movie id is required");
    const result = await MovieController.deleteMovie(movies, movieId);
    if (result.error) return sendError(res, result.status, result.error);
    return sendJson(res, result.status, { ok: true });
  }

  // PATCH /movies/:id
  if (method === "PATCH" && segments.length === 2 && segments[0] === "movies") {
    const movieId = segments[1];
    if (!movieId) return sendError(res, 400, "Movie id is required");
    const parsedMovieId = MovieIdSchema.safeParse(movieId);
    if (!parsedMovieId.success) {
      return sendError(res, 400, "Invalid movie id");
    }
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        await movies.patchMovie(parsedMovieId.data, data);
        return sendJson(res, 200, { ok: true });
      } catch (error) {
        console.error("Error patching movie:", error);
        return sendError(res, 400, "Invalid movie data");
      }
    });
    return;
  }

  // DELETE /movies/:id
  if (
    method === "DELETE" &&
    segments.length === 2 &&
    segments[0] === "movies"
  ) {
    const parsedMovieId = MovieIdSchema.safeParse(segments[1]);
    if (!parsedMovieId.success) {
      return sendError(res, 400, "Invalid movie id");
    }
    try {
      await movies.deleteMovie(parsedMovieId.data);
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      console.error("Error deleting movie:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  // GET /movies/:id/screenings
  if (
    method === "GET" &&
    segments.length === 3 &&
    segments[0] === "movies" &&
    (segments[2] === "screenings" || segments[2] === "seances")
  ) {
    const movieId = segments[1];
    if (!movieId) return sendError(res, 400, "Missing movie id");
    const result = await screeningController.listScreeningsByMovieId(
      screenings,
      movieId,
    );
    if (result.error) return sendError(res, result.status, result.error);
    return sendJson(res, 200, { ok: true, items: result.items });
  }

  // 404
  return sendError(res, 404, "Not found");
}
