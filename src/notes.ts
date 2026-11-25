import { z } from "zod";

export const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().max(10000).default(""),
});

export type NoteInput = z.infer<typeof noteInputSchema>;

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRepository {
  list(): Promise<Note[]>;
  create(input: NoteInput): Promise<Note>;
  update(id: string, input: NoteInput): Promise<Note | null>;
  remove(id: string): Promise<boolean>;
}
