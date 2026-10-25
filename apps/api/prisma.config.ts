import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Dùng chung một file .env ở thư mục gốc của repo
config({ path: "../../.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
