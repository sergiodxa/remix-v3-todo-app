import { z } from "zod";

export const TodoSchema = z.object({
  id: z.uuid(),

  title: z.string().min(1).max(255),
  completedAt: z.iso.datetime().nullable(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type TodoInput = z.input<typeof TodoSchema>;
export type TodoOutput = z.output<typeof TodoSchema>;
