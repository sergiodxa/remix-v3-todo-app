import { TodoSchema, type Todo } from "../../shared/schemas/todo";
import { matchSorter } from "match-sorter";

export class TodoModel {
  static file = Bun.file("./todos.json");

  private static async ensure() {
    if (await TodoModel.file.exists()) return;
    await TodoModel.write([]);
  }

  private static write(content: Todo[]) {
    return TodoModel.file.write(JSON.stringify(content, null, 2));
  }

  private static async read(): Promise<Todo[]> {
    return TodoSchema.array().parse(await TodoModel.file.json());
  }

  private static paginate(todos: Todo[], page: number, perPage: number) {
    return {
      count: todos.length,
      pages: Math.ceil(todos.length / perPage),
      todos: todos.slice((page - 1) * perPage, page * perPage),
    };
  }

  private static filter(todos: Todo[], query: string) {
    if (query.trim().length === 0) return todos;
    return matchSorter(todos, query.trim(), { keys: ["title"] });
  }

  static async list(filter?: string, page = 1, perPage = 10) {
    await TodoModel.ensure();
    let todos = await TodoModel.read();
    return TodoModel.paginate(
      TodoModel.filter(todos, filter || ""),
      page,
      perPage,
    );
  }

  static async show(id: string) {
    let todos = await TodoModel.read();
    return todos.find((todo) => todo.id === id) || null;
  }

  static async create(input: Pick<Todo, "title">) {
    let timestamp = new Date();

    let todo = TodoSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      completedAt: null,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
    });

    let todos = await TodoModel.read();
    todos.push(todo);

    await TodoModel.write(todos);
    return todo;
  }

  static async update(
    id: string,
    input: Partial<Pick<Todo, "title" | "completedAt">>,
  ) {
    let todos = await TodoModel.read();
    let todoIndex = todos.findIndex((todo) => todo.id === id);

    let todo = todos.at(todoIndex);
    if (!todo) return null;

    if ("title" in todo) todo.title = input.title || todo.title;
    if ("completedAt" in todo) todo.completedAt = input.completedAt || null;

    todos[todoIndex] = TodoSchema.parse({
      ...todo,
      updatedAt: new Date().toISOString(),
    });

    await TodoModel.write(todos);
    return todos[todoIndex];
  }

  static async destroy(id: string) {
    let todos = await TodoModel.read();
    let todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) return false;

    todos.splice(todoIndex, 1);
    await TodoModel.write(todos);

    return true;
  }
}
