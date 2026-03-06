import { Pool } from "pg";
import { Movie } from "../Domain/Movie";

export class MovieRepository {
  constructor(private pool: Pool) {}

  async getAllMovies(): Promise<Movie[]> {
    const result = await this.pool.query(`
        select
        id,
        title,
        description,
        duration_minutes as "durationMinutes",
        rating,
        release_date::text as "releaseDate" -- syntaxe Postgres
        from movies
        order by id asc;`);
    return result.rows;
  }
}
