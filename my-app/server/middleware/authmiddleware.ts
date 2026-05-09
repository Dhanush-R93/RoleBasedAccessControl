import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .derive(
    { as: "global" },
    async ({ jwt, headers, set, cookie: { token: jwtToken } }) => {
      if (!jwtToken.value) {
        set.status = 401;
        return { user: null };
      }
      const payload = await jwt.verify(jwtToken.value as string);

      if (!payload) {
        set.status = 401;
        return { user: null };
      }
      return {
        user: payload as { id: number; role: "ADMIN" | "EDITOR" | "USER" },
      };
    },
  );
