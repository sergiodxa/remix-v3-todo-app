import type { Remix } from "@remix-run/dom";
import type { Todo } from "../../shared/schemas/todo";
import { events, dom } from "@remix-run/events";
import TodosClient from "../clients/todos";
import { press } from "@remix-run/events/press";
import { App } from "./app";

export function TodoList(this: Remix.Handle) {
  const model = this.context.get(App);
  let todos: Todo[] = [];
  let page = 1;
  let pagination = { count: 0, pages: 1 };

  events(model, [
    TodosClient.todosFetched((event) => {
      todos = event.detail.todos;
      this.update();
    }),

    TodosClient.todosCreated((event) => {
      todos.push(event.detail.todo);
      this.update();
    }),

    TodosClient.todoFetched((event) => {
      let todo = todos.find((todo) => todo.id === event.detail.todo.id);
      if (todo) Object.assign(todo, event.detail.todo);
      else todos.push(event.detail.todo);
      this.update();
    }),

    TodosClient.todoUpdated((event) => {
      todos = todos.map((todo) =>
        todo.id === event.detail.todo.id ? event.detail.todo : todo,
      );
      this.update();
    }),

    TodosClient.todoDeleted((event) => {
      todos = todos.filter((todo) => todo.id !== event.detail.id);
      this.update();
      model.list({ page, perPage: 10 });
    }),

    TodosClient.paginationInfo((event) => {
      pagination = event.detail;
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
                dom.change((_, signal) => {
                  if (todo.completedAt) model.uncomplete(todo.id, signal);
                  else model.complete(todo.id, signal);
                }),
              ]}
            />
            <span class="flex-1 group-data-[completed=true]:line-through group-data-[completed=true]:text-zinc-400">
              {todo.title}
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              on={[press((_, signal) => model.destroy(todo.id, signal))]}
              aria-label={`Delete ${todo.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {pagination.pages > 1 && (
        <nav
          class="mt-4 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                type="button"
                class="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-300 aria-[current=page]:bg-blue-600 aria-[current=page]:text-white aria-[current=page]:border-none"
                on={[
                  press(async (_, signal) => {
                    page = pageNum;
                    await model.list({ page: pageNum, perPage: 10 }, signal);
                  }),
                ]}
                aria-current={pageNum === page ? "page" : undefined}
              >
                {pageNum}
              </button>
            ),
          )}
        </nav>
      )}
    </section>
  );
}
