import { connect, type Remix } from "@remix-run/dom";
import routes from "../../shared/routes";
import { submit } from "@remix-run/events";
import { App } from "./app";

export function TodoForm(this: Remix.Handle) {
  const model = this.context.get(App);

  let status: "idle" | "submitting" = "idle";
  let $input: HTMLInputElement;

  return () => (
    <form
      class="mt-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
      method="POST"
      action={routes.todos.create.href()}
      on={[
        submit(async (formData) => {
          status = "submitting";
          this.update();
          await model.create(formData.get("title") as string);
          $input.value = "";
          status = "idle";
          this.update();
        }),
      ]}
    >
      <div class="flex flex-col gap-1">
        <label htmlFor="title" class="text-sm font-medium text-zinc-700">
          Title
        </label>
        <input
          class="rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400"
          type="text"
          id="title"
          name="title"
          placeholder="Learn something new"
          disabled={status === "submitting"}
          on={[connect((event) => ($input = event.currentTarget))]}
        />
      </div>
      <button
        class="mt-3 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Adding..." : "Add Todo"}
      </button>
    </form>
  );
}
