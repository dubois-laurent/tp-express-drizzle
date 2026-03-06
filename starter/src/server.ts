import { pool } from "./Infrastructure/DB";
import { MovieRepository } from "./Infrastructure/MovieRepository";
import { ScreeningRepository } from "./Infrastructure/ScreeningRepository";
import { router } from "./router";
import express from "express";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3000);

const movies = new MovieRepository();
const screenings = new ScreeningRepository();
const deps = { pool, movies, screenings };

router(app, deps);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`http://localhost:${PORT}`);
});
