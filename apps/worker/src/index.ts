import { createOpenApiDocument } from "@flaremo/contracts";
import { Hono } from "hono";
import type { HonoBindings } from "./context";
import { appApi } from "./routes/app-api";
import { mcpApi } from "./routes/mcp";
import { memosApi } from "./routes/memos-api";
import { publicApi } from "./routes/public-api";
import { authRoutes } from "./routes/auth";
import { authMiddleware, isPublicPath } from "./auth/middleware";

const app = new Hono<HonoBindings>();

app.use("*", async (c, next) => {
  const origin = c.req.raw.headers.get("Origin");
  if (origin && origin !== new URL(c.req.url).origin) {
    const allowed = isPublicPath(c.req.path);
    if (!allowed) {
      return c.json({ error: { message: "Forbidden origin" } }, 403);
    }
  }
  await next();
});

app.route("/api/auth", authRoutes);

app.use("/api/*", authMiddleware);

app.route("/api/app", appApi);
app.route("/api/public", publicApi);
app.route("/api/v1", memosApi);
app.route("/api/v1", mcpApi);

app.get("/openapi.json", (c) => c.json(createOpenApiDocument()));
app.get("/api/v1/openapi.json", (c) => c.json(createOpenApiDocument()));

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: { message: "Not found" } }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
