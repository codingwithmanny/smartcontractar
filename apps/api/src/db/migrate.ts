// Imports
// ========================================================
import { promises as fs } from "fs";
import { FileMigrationProvider, Migrator } from "kysely";
import path from "path";
import { db } from "./kysely";

// Config
// ========================================================
const COMMANDS = ["--up", "--down", "--latest"];

// Main
// ========================================================
(async () => {
  console.group(
    "MIGRATION\n========================================================"
  );
  const args = process.argv.slice(2);
  const command = args[0];

  if (!COMMANDS.includes(command)) {
    console.error(`Invalid command: ${command}`);
    process.exit(1);
  }

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // Path to the folder that contains all your migrations.
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  switch (command) {
    case "--up":
      console.log("- MIGRATE UP");
      const { results: resultsUp, error: errorUp } = await migrator.migrateUp();

      if (resultsUp?.length === 0) console.log("Already up to date");

      resultsUp?.forEach((it) => {
        if (it.status === "Success") {
          console.log(
            `migration "${it.migrationName}" was executed successfully`
          );
        } else if (it.status === "Error") {
          console.error(`failed to execute migration "${it.migrationName}"`);
        }
      });

      if (errorUp) {
        console.error("failed to migrate");
        console.error(errorUp);
        process.exit(1);
      }
      break;
    case "--down":
      console.log("- MIGRATE DOWN");
      const { results: resultsDown, error: errorDown } = await migrator.migrateDown();

      resultsDown?.forEach((it) => {
        if (it.status === "Success") {
          console.log(
            `migration "${it.migrationName}" was executed successfully`
          );
        } else if (it.status === "Error") {
          console.error(`failed to execute migration "${it.migrationName}"`);
        }
      });

      if (errorDown) {
        console.error("failed to migrate");
        console.error(errorDown);
        process.exit(1);
      }
      break;
    case "--latest":
      console.log("- MIGRATE LATEST");

      const { error, results } = await migrator.migrateToLatest();

      if (results?.length === 0) console.log("Already up to date");

      results?.forEach((it) => {
        if (it.status === "Success") {
          console.log(
            `migration "${it.migrationName}" was executed successfully`
          );
        } else if (it.status === "Error") {
          console.error(`failed to execute migration "${it.migrationName}"`);
        }
      });

      if (error) {
        console.error("failed to migrate");
        console.error(error);
        process.exit(1);
      }
      break;
    default:
      break;
  }

  await db.destroy();

  console.groupEnd();
})();
