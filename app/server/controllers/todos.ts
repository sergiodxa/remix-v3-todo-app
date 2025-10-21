import type { RouteHandlers } from "@remix-run/fetch-router";
import type routes from "../../shared/routes";
import { Todo } from "../models/todo";
import z from "zod";

export default {
  use: [],
  handlers: {
    async index() {
      let todos = await Todo.list();
      return Response.json(todos);
    },

    async show({ params }) {
      let todo = await Todo.show(params.id);
      if (todo) return Response.json(todo);
      return Response.json({ message: "Not Found" }, { status: 404 });
    },

    async create({ formData }) {
      let result = await Todo.create({
        title: formData.get("title") as string,
      });

      return Response.json({ data: result, meta: {} });
    },

    async update({ params, formData }) {
      try {
        let title = z.string().nullable().parse(formData.get("title"));
        let completedAt = z.iso
          .datetime()
          .or(z.literal("null").transform(() => null))
          .nullable()
          .parse(formData.get("completedAt"));
        let result = await Todo.update(params.id, {
          title: title ?? undefined,
          completedAt: completedAt || undefined,
        });
        if (result) return Response.json(result);
        return Response.json({ message: "Not Found" }, { status: 404 });
      } catch (error) {
        console.error(new Error("Failed to update todo", { cause: error }));
        return Response.json(
          { message: "Bad Request", error },
          { status: 400 },
        );
      }
    },

    async destroy({ params }) {
      let result = await Todo.destroy(params.id);
      if (result) return Response.json(result);
      return Response.json({ message: "Not Found" }, { status: 404 });
    },
  },
} satisfies RouteHandlers<typeof routes.todos>;
