import { Hono } from "hono";
import { cors } from "hono/cors";
import type { HonoBindings } from "./context";
import { appApi } from "./routes/app-api";
import { memosApi } from "./routes/memos-api";

const app = new Hono<HonoBindings>();

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["content-type", "authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.route("/api/app", appApi);
app.route("/api/v1", memosApi);

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: { message: "Not found" } }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
