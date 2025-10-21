import type { Remix } from "@remix-run/dom";
import type { TodoOutput } from "../../shared/todo";
import { events, dom } from "@remix-run/events";
import Model from "../model";
import { press } from "@remix-run/events/press";
import { App } from "./app";

export function TodoList(this: Remix.Handle) {
  const model = this.context.get(App);
  let todos: TodoOutput[] = [];

  events(model, [
    Model.todosFetched((event) => {
      todos = event.detail.todos;
      this.update();
    }),

    Model.todosCreated((event) => {
      todos.push(event.detail.todo);
      this.update();
    }),

    Model.todoFetched((event) => {
      let todo = todos.find((todo) => todo.id === event.detail.todo.id);
      if (todo) Object.assign(todo, event.detail.todo);
      else todos.push(event.detail.todo);
      this.update();
    }),

    Model.todoUpdated((event) => {
      todos = todos.map((todo) =>
        todo.id === event.detail.todo.id ? event.detail.todo : todo,
      );
      this.update();
    }),

    Model.todoDeleted((event) => {
      todos = todos.filter((todo) => todo.id !== event.detail.id);
      this.update();
    }),
  ]);

  return () => (
    <section class="mt-6 group" data-empty={String(todos.length === 0)}>
      <p class="text-sm text-zinc-500 group-data-[empty=false]:hidden">
        No todos yet. Add your first one above.
      </p>
      <ul class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm group-data-[empty=true]:hidden">
        {todos.map((todo) => (
          <li
            key={todo.id}
            data-completed={String(Boolean(todo.completedAt))}
            class="p-4 hover:bg-zinc-50 border-b last:border-b-0 border-zinc-200 flex items-center gap-3 group"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              checked={Boolean(todo.completedAt)}
              on={[
                dom.change(() => {
                  if (todo.completedAt) model.uncomplete(todo.id);
                  else model.complete(todo.id);
                }),
              ]}
            />
            <span class="flex-1 group-data-[completed=true]:line-through group-data-[completed=true]:text-zinc-400">
              {todo.title}
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              on={[press(() => model.destroy(todo.id))]}
              aria-label={`Delete ${todo.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
