import { TodoSchema, type TodoOutput } from "../../shared/todo";

export class Todo {
  static file = Bun.file("./todos.json");

  static async list(): Promise<TodoOutput[]> {
    return TodoSchema.array().parse(await Todo.file.json());
  }

  static async show(id: string): Promise<TodoOutput | null> {
    let todos = await Todo.list();
    return todos.find((todo) => todo.id === id) || null;
  }

  static async create(input: Pick<TodoOutput, "title">): Promise<TodoOutput> {
    let timestamp = new Date();

    let todo = TodoSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      completedAt: null,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
    });

    let todos = await Todo.list();
    todos.push(todo);
    await Todo.file.write(JSON.stringify(todos, null, 2));

    return todo;
  }

  static async update(
    id: string,
    input: Partial<Pick<TodoOutput, "title" | "completedAt">>,
  ): Promise<TodoOutput | null> {
    let todos = await Todo.list();
    let todoIndex = todos.findIndex((todo) => todo.id === id);

    let todo = todos.at(todoIndex);
    if (!todo) return null;

    if ("title" in todo) todo.title = input.title || todo.title;
    if ("completedAt" in todo) todo.completedAt = input.completedAt || null;

    todos[todoIndex] = TodoSchema.parse({
      ...todo,
      updatedAt: new Date().toISOString(),
    });

    await Todo.file.write(JSON.stringify(todos, null, 2));
    return todos[todoIndex];
  }

  static async destroy(id: string): Promise<boolean> {
    let todos = await Todo.list();
    let todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) return false;

    todos.splice(todoIndex, 1);
    await Todo.file.write(JSON.stringify(todos, null, 2));

    return true;
  }
}
