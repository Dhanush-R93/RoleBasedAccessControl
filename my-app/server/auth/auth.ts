// server.ts
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { jwt } from "@elysiajs/jwt";
const auth = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
    }),
  )
  .post(
    "/auth/signup",
    async ({ body, set }) => {
      const { name, email, password, role } = body;

      try {
        // 1. Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          set.status = 400;
          return { success: false, error: "Email already registered" };
        }

        // 2. Hash the password
        const hashedPassword = await argon2.hash(password);

        // 3. Insert into Database
        // Note: role defaults to 'USER' based on our schema
        const [newUser] = await db
          .insert(users)
          .values({
            name,
            email,
            password: hashedPassword,
            role,
          })
          .returning();

        return {
          success: true,
          user: { id: newUser.id, name: newUser.name, role: newUser.role },
        };
      } catch (error) {
        set.status = 500;
        return { success: false, error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        role: t.Optional(
          t.Enum({
            ADMIN: "ADMIN",
            USER: "USER",
            EDITOR: "EDITOR",
          }),
        ),
      }),
    },
  )
  .post(
    "/auth/login",
    async ({ body, jwt, set, cookie:{token} }) => {
      const { email, password } = body;
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        set.status = 401;
        return { error: "Invalid email or password" };
      }

      // Verify password
      const isPasswordValid = await argon2.verify(user?.password, password);
      if (!isPasswordValid) {
        set.status = 401;
        return { error: "Invalid email or password" };
      }

      // Generate JWT with User Info (Role-Based)
      const jwtToken = await jwt.sign({
        id: user.id,
        role: user.role,
      });
      token.set({
        value: jwtToken,
        httpOnly: true, // JS cannot access it (XSS protection)
        secure: true, // HTTPS only in production
        sameSite: "lax", // CSRF protection
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: "/",
      });
      return {
        success: true,
        message:"Sucessfully Verified "
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    },
  )
  .post('/auth/logout', ({ cookie: { token }, set }) => {
    token.remove(); 
    return { success: true, message: "Logged out" };
  })

export { auth };
