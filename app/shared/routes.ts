import { resources, route } from "@remix-run/fetch-router";

export default route({
  todos: resources("todos", {
    only: ["index", "show", "create", "update", "destroy"],
  }),
});
