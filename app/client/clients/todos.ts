import { createEventType } from "@remix-run/events";
import routes from "../../shared/routes";
import { TodoSchema, type Todo } from "../../shared/schemas/todo";

const [todosFetched, createTodosFetched] = createEventType<{
  todos: Todo[];
}>("todos:fetched");

const [todosCreated, createTodosCreated] = createEventType<{
  todo: Todo;
}>("todos:created");

const [todoFetched, createTodoFetched] = createEventType<{
  todo: Todo;
}>("todo:fetched");

const [todoUpdated, createTodoUpdated] = createEventType<{
  todo: Todo;
}>("todo:updated");

const [todoDeleted, createTodoDeleted] =
  createEventType<Pick<Todo, "id">>("todo:deleted");

const [paginationInfo, createPaginationInfo] = createEventType<{
  count: number;
  pages: number;
}>("pagination:info");

export default class TodosClient extends EventTarget {
  constructor(protected signal: AbortSignal) {
    super();
  }

  fetch(id?: string, q?: string, signal?: AbortSignal) {
    if (id) return this.show(id, signal);
    return this.list({ query: q }, signal);
  }

  async list(
    {
      query,
      page = 1,
      perPage = 10,
    }: { query?: string; page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ) {
    let url = new URL(routes.todos.index.href(), location.href);
    let searchParams = new URLSearchParams();

    if (query && query.trim()) searchParams.set("q", query.trim());
    searchParams.set("page", page?.toString() ?? "1");
    searchParams.set("per_page", perPage?.toString() ?? "10");
    if (searchParams.toString()) url.search = searchParams.toString();

    const mergedSignal = signal
      ? AbortSignal.any([this.signal, signal])
      : this.signal;
    let response = await fetch(url, { signal: mergedSignal });

    let body = await response.json();
    let todos = TodoSchema.array().parse(body);

    let count = parseInt(response.headers.get("X-Total-Count") || "0", 10);
    let pages = parseInt(response.headers.get("X-Total-Pages") || "0", 10);

    this.dispatchEvent(createTodosFetched({ detail: { todos } }));
    this.dispatchEvent(createPaginationInfo({ detail: { count, pages } }));
  }

  async show(id: string, signal?: AbortSignal) {
    const mergedSignal = signal
      ? AbortSignal.any([this.signal, signal])
      : this.signal;
    let response = await fetch(routes.todos.show.href({ id }), {
      signal: mergedSignal,
    });

    let body = await response.json();
    let todo = TodoSchema.parse(body);

    this.dispatchEvent(createTodoFetched({ detail: { todo } }));
  }

  async create(title: string, signal?: AbortSignal) {
    let formData = new FormData();
    formData.append("title", title);

    const mergedSignal = signal
      ? AbortSignal.any([this.signal, signal])
      : this.signal;
    let response = await fetch(routes.todos.create.href(), {
      method: "POST",
      body: formData,
      signal: mergedSignal,
    });

    let body = await response.json();
    let todo = TodoSchema.parse(body.data);

    this.dispatchEvent(createTodosCreated({ detail: { todo } }));
  }

  async update(
    id: string,
    data: Partial<Pick<Todo, "title" | "completedAt">>,
    signal?: AbortSignal,
  ) {
    let formData = new FormData();
    if (data.title) formData.append("title", data.title);

    if (data.completedAt !== undefined) {
      formData.append("completedAt", data.completedAt ?? "null");
    }

    const mergedSignal = signal
      ? AbortSignal.any([this.signal, signal])
      : this.signal;
    let response = await fetch(routes.todos.update.href({ id }), {
      method: "PUT",
      body: formData,
      signal: mergedSignal,
    });

    let body = await response.json();
    let todo = TodoSchema.parse(body);

    this.dispatchEvent(createTodoUpdated({ detail: { todo: todo } }));
  }

  async destroy(id: string, signal?: AbortSignal) {
    const mergedSignal = signal
      ? AbortSignal.any([this.signal, signal])
      : this.signal;
    await fetch(routes.todos.destroy.href({ id }), {
      method: "DELETE",
      signal: mergedSignal,
    });

    this.dispatchEvent(createTodoDeleted({ detail: { id } }));
  }

  async uncomplete(id: string, signal?: AbortSignal) {
    await this.update(id, { completedAt: null }, signal);
  }

  async complete(id: string, signal?: AbortSignal) {
    await this.update(id, { completedAt: new Date().toISOString() }, signal);
  }

  static todosFetched = todosFetched;
  static todosCreated = todosCreated;
  static todoFetched = todoFetched;
  static todoUpdated = todoUpdated;
  static todoDeleted = todoDeleted;
  static paginationInfo = paginationInfo;
}
