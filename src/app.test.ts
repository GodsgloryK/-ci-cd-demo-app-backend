import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createInMemoryNoteRepository } from "./memory-repository.js";
import type { NoteRepository } from "./notes.js";

describe("notes API", () => {
  let repository: NoteRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = createInMemoryNoteRepository();
    app = createApp(repository);
  });

  it("validates note input", async () => {
    const response = await request(app)
      .post("/api/notes")
      .send({ title: "", content: "Body" });

    expect(response.status).toBe(400);
    expect(typeof response.body.message).toBe("string");
  });

  it("creates, lists, updates, and deletes a note", async () => {
    const created = await request(app)
      .post("/api/notes")
      .send({ title: "First note", content: "Body" });

    expect(created.status).toBe(201);
    expect(created.body.title).toBe("First note");

    const listed = await request(app).get("/api/notes");
    expect(listed.status).toBe(200);
    expect(listed.body).toHaveLength(1);

    const updated = await request(app)
      .put(`/api/notes/${created.body.id}`)
      .send({ title: "Updated note", content: "New body" });

    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("Updated note");
    expect(updated.body.content).toBe("New body");

    const removed = await request(app).delete(`/api/notes/${created.body.id}`);
    expect(removed.status).toBe(204);

    const empty = await request(app).get("/api/notes");
    expect(empty.body).toHaveLength(0);
  });

  it("returns 404 for a missing note", async () => {
    const response = await request(app)
      .put(`/api/notes/${randomUUID()}`)
      .send({ title: "Missing", content: "" });

    expect(response.status).toBe(404);
  });
});
