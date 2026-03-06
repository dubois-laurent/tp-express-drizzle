import { eq } from "drizzle-orm";
import { Movie } from "../Domain/Movie";
import { db } from "./drizzle";
import { movieSchema } from "./schema";
export class MovieRepository {
  async getAllMovies(): Promise<Movie[]> {
    const result = await db.select().from(movieSchema);
    return result;
  }

  async getMovieById(id: string): Promise<Movie | null> {
    const result = await db
      .select()
      .from(movieSchema)
      .where(eq(movieSchema.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async createMovie(movie: Movie): Promise<void> {
    await db.insert(movieSchema).values(movie);
  }

  async updateMovie(id: string, movie: Movie): Promise<void> {
    await db.update(movieSchema).set(movie).where(eq(movieSchema.id, id));
  }

  async patchMovie(id: string, movie: Partial<Movie>): Promise<void> {
    await db.update(movieSchema).set(movie).where(eq(movieSchema.id, id));
  }

  async deleteMovie(id: string): Promise<void> {
    await db.delete(movieSchema).where(eq(movieSchema.id, id));
  }
}
