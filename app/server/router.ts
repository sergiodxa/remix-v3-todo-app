import { createRouter } from "@remix-run/fetch-router";
import routes from "../shared/routes";
import todos from "./controllers/todos";

const router = createRouter({
  defaultHandler() {
    return Response.json({ message: "Not Found" }, { status: 404 });
  },
});

router.map(routes.todos, todos);

export default router;
