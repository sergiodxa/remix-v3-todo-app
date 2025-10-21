import { type Remix } from "@remix-run/dom";
import { press } from "@remix-run/events/press";
import Model from "../model";
import { TodoForm } from "./todo-form";
import { TodoList } from "./todo-list";

export function App(this: Remix.Handle<Model>) {
  const model = new Model(this.signal);
  this.context.set(model);

  this.queueTask(() => model.list());

  return () => (
    <main class="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <div class="mx-auto max-w-2xl p-6">
        <header class="flex items-center justify-between gap-4">
          <h1 class="text-2xl font-semibold tracking-tight">Todo App</h1>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            on={[press(() => model.list())]}
          >
            Refresh
          </button>
        </header>
        <TodoForm />
        <TodoList />
      </div>
    </main>
  );
}
