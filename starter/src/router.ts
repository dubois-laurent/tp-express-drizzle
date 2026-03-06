import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Pool } from "pg";
import type { MovieRepository } from "./Infrastructure/MovieRepository.js";
import type { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";
import * as MovieController from "./controllers/MovieController";
import * as screeningController from "./controllers/ScreeningController";
import express from "express";

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

export function router(app: express.Express, deps: RouterDeps): void {
  // GET /health
  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  // GET /movies
  app.get("/movies", async (req, res) => {
    try {
      const items = await MovieController.getAllMovies(deps.movies);
      res.json({ ok: true, items });
    } catch {
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });

  // GET /movies/:id
  app.get("/movies/:id", async (req, res) => {
    const movieId = req.params.id;
    if (!movieId)
      return res.status(400).json({ ok: false, error: "Movie id is required" });
    const result = await MovieController.getMovieById(deps.movies, movieId);
    if (result.error)
      return res.status(result.status).json({ ok: false, error: result.error });
    res.json({ ok: true, item: result.movie });
  });

  // POST /movies
  app.post("/movies", async (req, res) => {
    try {
      const result = await MovieController.createMovie(deps.movies, req.body);
      res.status(result.status).json({ ok: true });
    } catch {
      res.status(400).json({ ok: false, error: "Invalid movie data" });
    }
  });

  // PUT /movies/:id
  app.put("/movies/:id", async (req, res) => {
    const movieId = req.params.id;
    if (!movieId)
      return res.status(400).json({ ok: false, error: "Movie id is required" });
    try {
      const result = await MovieController.updateMovie(
        deps.movies,
        movieId,
        req.body,
      );
      if (result.error)
        return res
          .status(result.status)
          .json({ ok: false, error: result.error });
      res.status(result.status).json({ ok: true });
    } catch {
      res.status(400).json({ ok: false, error: "Invalid movie data" });
    }
  });

  // PATCH /movies/:id
  app.patch("/movies/:id", async (req, res) => {
    const movieId = req.params.id;
    if (!movieId)
      return res.status(400).json({ ok: false, error: "Movie id is required" });
    const parsedMovieId = MovieIdSchema.safeParse(movieId);
    if (!parsedMovieId.success) {
      return res.status(400).json({ ok: false, error: "Invalid movie id" });
    }
    try {
      await deps.movies.patchMovie(parsedMovieId.data, req.body);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error patching movie:", error);
      res.status(400).json({ ok: false, error: "Invalid movie data" });
    }
  });

  // DELETE /movies/:id
  app.delete("/movies/:id", async (req, res) => {
    const movieId = req.params.id;
    const parsedMovieId = MovieIdSchema.safeParse(movieId);
    if (!parsedMovieId.success) {
      return res.status(400).json({ ok: false, error: "Invalid movie id" });
    }
    try {
      await deps.movies.deleteMovie(parsedMovieId.data);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });

  // GET /movies/:id/screenings
  app.get("/movies/:id/screenings", async (req, res) => {
    const movieId = req.params.id;
    if (!movieId)
      return res.status(400).json({ ok: false, error: "Missing movie id" });
    const result = await screeningController.listScreeningsByMovieId(
      deps.screenings,
      movieId,
    );
    if (result.error)
      return res.status(result.status).json({ ok: false, error: result.error });
    res.json({ ok: true, items: result.items });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ ok: false, error: "Not found" });
  });
}
