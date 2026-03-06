-- =========================
-- CINÉCONNECT - SCHEMA
-- =========================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  rating TEXT,
  release_date DATE
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  price NUMERIC(6,2) NOT NULL
);

-- =========================
-- SAMPLE DATA
-- =========================

INSERT INTO movies (title, description, duration_minutes, rating, release_date)
VALUES
  ('Inception', 'Sci-fi thriller about dreams within dreams.', 148, 'PG-13', '2010-07-16'),
  ('Interstellar', 'Exploration through space and time.', 169, 'PG-13', '2014-11-07'),
  ('The Dark Knight', 'Batman faces the Joker.', 152, 'PG-13', '2008-07-18');

INSERT INTO rooms (name, capacity)
VALUES
  ('Room A', 120),
  ('Room B', 80);
