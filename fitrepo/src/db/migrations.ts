import { db } from './database'

export function initDatabase() {
  // Enable foreign key constraints (important in SQLite)
  db.execSync(`
    PRAGMA foreign_keys = ON;
  `)

  // WORKOUTS TABLE
  db.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      name TEXT NOT NULL,
      performed_at TEXT NOT NULL,              -- ISO datetime string
      is_finished INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true

      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // EXERCISES TABLE (reusable master list)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('timed', 'reps')),

      image_uri TEXT,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // WORKOUT_EXERCISES TABLE
  db.execSync(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,

      set_count INTEGER NOT NULL,

      rep_count INTEGER,
      time_per_set_seconds INTEGER,

      FOREIGN KEY (workout_id)
        REFERENCES workouts(id)
        ON DELETE CASCADE,

      FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
    );
  `)

  db.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      workout_streak INTEGER 
    );
    `)
}