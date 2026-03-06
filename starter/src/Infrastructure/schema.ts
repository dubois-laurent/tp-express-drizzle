import { pgTable, uuid, text, integer, real } from "drizzle-orm/pg-core";

export const movieSchema = pgTable("movies", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes"),
  rating: text("rating"),
  releaseDate: text("release_date"),
});

export const screeningSchema = pgTable("screenings", {
  id: uuid("id").primaryKey().defaultRandom(),
  movieId: uuid("movie_id").notNull(),
  startTime: text("start_time").notNull(),
  price: real("price").notNull(),
  roomId: uuid("room_id").notNull(),
});

export const roomSchema = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
});
