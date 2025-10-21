import { TodoSchema, type Todo } from "../../shared/schemas/todo";

export class TodoModel {
  static file = Bun.file("./todos.json");

  static async list(): Promise<Todo[]> {
    return TodoSchema.array().parse(await TodoModel.file.json());
  }

  static async show(id: string): Promise<Todo | null> {
    let todos = await TodoModel.list();
    return todos.find((todo) => todo.id === id) || null;
  }

  static async create(input: Pick<Todo, "title">): Promise<Todo> {
    let timestamp = new Date();

    let todo = TodoSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      completedAt: null,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
    });

    let todos = await TodoModel.list();
    todos.push(todo);
    await TodoModel.file.write(JSON.stringify(todos, null, 2));

    return todo;
  }

  static async update(
    id: string,
    input: Partial<Pick<Todo, "title" | "completedAt">>,
  ): Promise<Todo | null> {
    let todos = await TodoModel.list();
    let todoIndex = todos.findIndex((todo) => todo.id === id);

    let todo = todos.at(todoIndex);
    if (!todo) return null;

    if ("title" in todo) todo.title = input.title || todo.title;
    if ("completedAt" in todo) todo.completedAt = input.completedAt || null;

    todos[todoIndex] = TodoSchema.parse({
      ...todo,
      updatedAt: new Date().toISOString(),
    });

    await TodoModel.file.write(JSON.stringify(todos, null, 2));
    return todos[todoIndex];
  }

  static async destroy(id: string): Promise<boolean> {
    let todos = await TodoModel.list();
    let todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) return false;

    todos.splice(todoIndex, 1);
    await TodoModel.file.write(JSON.stringify(todos, null, 2));

    return true;
  }
}
