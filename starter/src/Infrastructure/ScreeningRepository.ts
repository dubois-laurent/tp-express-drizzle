import { roomSchema, screeningSchema } from "./schema";
import { db } from "./drizzle";
import { asc, eq } from "drizzle-orm";

export class ScreeningRepository {
  async listScreeningsByMovieId(movieId: string) {
    const rows = await db
      .select({
        id: screeningSchema.id,
        movieId: screeningSchema.movieId,
        startTime: screeningSchema.startTime,
        price: screeningSchema.price,
        roomId: roomSchema.id,
        roomName: roomSchema.name,
        roomCapacity: roomSchema.capacity,
      })
      .from(screeningSchema)
      .innerJoin(roomSchema, eq(roomSchema.id, screeningSchema.roomId))
      .where(eq(screeningSchema.movieId, movieId))
      .orderBy(asc(screeningSchema.startTime));

    return rows;
  }
}
