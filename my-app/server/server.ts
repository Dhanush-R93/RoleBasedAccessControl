// server.ts
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth/auth";
import { postRoutes } from "./posts/index";
const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  )
  .get("/hi", () => "Hi Elysia")
  .use(auth)
  .use(postRoutes)

export { app };
export type App = typeof app;
