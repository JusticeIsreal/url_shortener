import { Pool } from "pg";
import fs from "fs";
import path from "path";

interface MigrationRow {
  name: string;
}

async function runMigrations(pool: Pool) {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Read migration files
    const migrationsDir = path.join(__dirname, "../../migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    // Check which migrations have been executed
    const { rows: executedMigrations } = await pool.query<MigrationRow>(
      "SELECT name FROM migrations"
    );
    const executedFiles = new Set(
      executedMigrations.map((row: MigrationRow) => row.name)
    );

    // Run pending migrations
    for (const file of files) {
      if (!executedFiles.has(file)) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        await pool.query(sql);
        await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        console.log(`Executed migration: ${file}`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

export default runMigrations;
