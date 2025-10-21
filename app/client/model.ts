import { createEventType } from "@remix-run/events";
import routes from "../shared/routes";
import { TodoSchema, type TodoOutput } from "../shared/todo";

const [todosFetched, createTodosFetched] = createEventType<{
  todos: TodoOutput[];
}>("todos:fetched");

const [todosCreated, createTodosCreated] = createEventType<{
  todo: TodoOutput;
}>("todos:created");

const [todoFetched, createTodoFetched] = createEventType<{
  todo: TodoOutput;
}>("todo:fetched");

const [todoUpdated, createTodoUpdated] = createEventType<{
  todo: TodoOutput;
}>("todo:updated");

const [todoDeleted, createTodoDeleted] =
  createEventType<Pick<TodoOutput, "id">>("todo:deleted");

export default class Model extends EventTarget {
  constructor(protected signal: AbortSignal) {
    super();
  }

  fetch(id?: string) {
    if (id) return this.show(id);
    return this.list();
  }

  async list() {
    let response = await fetch(routes.todos.index.href(), {
      signal: this.signal,
    });
    let body = await response.json();
    let todos = TodoSchema.array().parse(body);
    this.dispatchEvent(createTodosFetched({ detail: { todos } }));
  }

  async show(id: string) {
    let response = await fetch(routes.todos.show.href({ id }), {
      signal: this.signal,
    });
    let body = await response.json();
    let todo = TodoSchema.parse(body);
    this.dispatchEvent(createTodoFetched({ detail: { todo } }));
  }

  async create(title: string) {
    let formData = new FormData();
    formData.append("title", title);
    let response = await fetch(routes.todos.create.href(), {
      method: "POST",
      body: formData,
      signal: this.signal,
    });
    let body = await response.json();
    let todo = TodoSchema.parse(body.data);
    this.dispatchEvent(createTodosCreated({ detail: { todo } }));
  }

  async update(
    id: string,
    data: Partial<Pick<TodoOutput, "title" | "completedAt">>,
  ) {
    let formData = new FormData();
    if (data.title) formData.append("title", data.title);

    if (data.completedAt !== undefined) {
      formData.append("completedAt", data.completedAt ?? "null");
    }

    let response = await fetch(routes.todos.update.href({ id }), {
      method: "PUT",
      body: formData,
      signal: this.signal,
    });

    let body = await response.json();
    let todo = TodoSchema.parse(body);

    this.dispatchEvent(createTodoUpdated({ detail: { todo: todo } }));
  }

  async destroy(id: string) {
    await fetch(routes.todos.destroy.href({ id }), {
      method: "DELETE",
      signal: this.signal,
    });
    this.dispatchEvent(createTodoDeleted({ detail: { id } }));
  }

  async uncomplete(id: string) {
    await this.update(id, { completedAt: null });
  }

  async complete(id: string) {
    await this.update(id, { completedAt: new Date().toISOString() });
  }

  static todosFetched = todosFetched;
  static todosCreated = todosCreated;
  static todoFetched = todoFetched;
  static todoUpdated = todoUpdated;
  static todoDeleted = todoDeleted;
}
