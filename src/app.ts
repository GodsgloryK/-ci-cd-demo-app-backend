import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { noteInputSchema, type NoteRepository } from "./notes.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

export function createApp(repository: NoteRepository) {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/notes", async (_req, res) => {
    res.json(await repository.list());
  });

  app.post("/api/notes", async (req, res) => {
    const parsed = noteInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid note",
      });
      return;
    }

    res.status(201).json(await repository.create(parsed.data));
  });

  app.put("/api/notes/:id", async (req, res) => {
    const parsed = noteInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid note",
      });
      return;
    }

    const note = await repository.update(String(req.params.id), parsed.data);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.json(note);
  });

  app.delete("/api/notes/:id", async (req, res) => {
    const removed = await repository.remove(String(req.params.id));
    if (!removed) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.status(204).end();
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ message: getErrorMessage(error) });
  });

  return app;
}
