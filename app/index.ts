import index from "./client/index.html";
import router from "./server/router";

const server = Bun.serve({
  development: Bun.env.NODE_ENV !== "production",
  routes: { "/": index },
  fetch(request) {
    return router.fetch(request);
  },
});

console.log("Server started on http://%s:%d", server.hostname, server.port);
