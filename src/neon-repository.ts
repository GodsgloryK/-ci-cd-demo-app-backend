import { neon } from "@neondatabase/serverless";
import type { Note, NoteInput, NoteRepository } from "./notes.js";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
}

interface IdRow {
  id: string;
}

function asRows<Row>(value: unknown): Row[] {
  return value as Row[];
}

function mapRow(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function createNeonNoteRepository(connectionString: string): NoteRepository {
  const sql = neon(connectionString);

  return {
    async list() {
      const rows = asRows<NoteRow>(await sql`
        SELECT id, title, content, created_at, updated_at
        FROM notes
        ORDER BY updated_at DESC
      `);
      return rows.map(mapRow);
    },

    async create(input: NoteInput) {
      const rows = asRows<NoteRow>(await sql`
        INSERT INTO notes (title, content)
        VALUES (${input.title}, ${input.content})
        RETURNING id, title, content, created_at, updated_at
      `);
      const row = rows[0];
      if (!row) {
        throw new Error("Could not create note");
      }
      return mapRow(row);
    },

    async update(id: string, input: NoteInput) {
      const rows = asRows<NoteRow>(await sql`
        UPDATE notes
        SET title = ${input.title}, content = ${input.content}, updated_at = now()
        WHERE id = ${id}
        RETURNING id, title, content, created_at, updated_at
      `);
      const row = rows[0];
      return row ? mapRow(row) : null;
    },

    async remove(id: string) {
      const rows = asRows<IdRow>(await sql`
        DELETE FROM notes
        WHERE id = ${id}
        RETURNING id
      `);
      return rows.length > 0;
    },
  };
}
