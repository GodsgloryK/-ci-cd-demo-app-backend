import { randomUUID } from "node:crypto";
import type { Note, NoteInput, NoteRepository } from "./notes.js";

export function createInMemoryNoteRepository(): NoteRepository {
  const notes: Note[] = [];

  return {
    async list() {
      return [...notes].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
    },

    async create(input: NoteInput) {
      const now = new Date().toISOString();
      const note: Note = {
        id: randomUUID(),
        title: input.title,
        content: input.content,
        createdAt: now,
        updatedAt: now,
      };
      notes.push(note);
      return { ...note };
    },

    async update(id: string, input: NoteInput) {
      const index = notes.findIndex((note) => note.id === id);
      if (index === -1) {
        return null;
      }

      const updated: Note = {
        ...notes[index],
        title: input.title,
        content: input.content,
        updatedAt: new Date().toISOString(),
      };
      notes[index] = updated;
      return { ...updated };
    },

    async remove(id: string) {
      const index = notes.findIndex((note) => note.id === id);
      if (index === -1) {
        return false;
      }

      notes.splice(index, 1);
      return true;
    },
  };
}
