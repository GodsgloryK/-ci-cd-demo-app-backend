import { createApp } from "./app.js";
import { createNeonNoteRepository } from "./neon-repository.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const port = Number(process.env.PORT ?? 3000);

createApp(createNeonNoteRepository(connectionString)).listen(port, () => {
  console.log(`Notes app listening on port ${port}`);
});
