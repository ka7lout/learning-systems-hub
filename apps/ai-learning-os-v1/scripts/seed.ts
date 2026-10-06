import "dotenv/config";
import { seedAll } from "@/db/seed";
import { pool } from "@/db";

seedAll()
  .then((r) => {
    console.log("Seed complete:", r);
    return pool.end();
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
