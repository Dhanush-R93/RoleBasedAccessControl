import { Elysia, t } from "elysia";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { authMiddleware } from "../middleware/authmiddleware";
import { checkPermission } from "../middleware/rbac";
import { Permissions } from "../types/roles";
import { readFile } from "node:fs/promises";
import { eq, and } from "drizzle-orm";
export const postRoutes = new Elysia({ prefix: "/posts" })
  .use(authMiddleware)
  .decorate("generateTestString", async (path: string): Promise<string> => {
    try {
      const imageBuffer = await readFile(path);
      const base64 = imageBuffer.toString("base64");
      const extension = path.split(".").pop();
      const mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;

      const finalString = `data:${mimeType};base64,${base64}`;
      return finalString;
    } catch (error) {
      console.error("Could not find file at path:", path);
      return "";
    }
  })
  .post(
    "/",
    async ({ body, user, set, generateTestString }) => {
      const image = await generateTestString(
        "D:\\BetterAuth\\BetterAuth-project1\\RBAC\\my-app\\public\\image1.jpg",
      );
      try {
        const [newPost] = await db
          .insert(posts)
          .values({
            description: body.description,
            imageData: image,
            imageMimeType: body.mimeType,
            authorId: user!.id,
          })
          .returning();
        return {
          success: true,
          message: "Post created successfully",
          data: newPost,
        };
      } catch (err) {
        set.status = 500;
        return { success: false, message: "Database error occurred" };
      }
    },
    {
      beforeHandle: checkPermission(Permissions.CREATE_POST),
      body: t.Object({
        description: t.String({ minLength: 5 }),

        mimeType: t.String(),
      }),
    },
  )
  .get(
    "/",
    async ({ set }) => {
      try {
        const allPosts = await db
          .select({
            id: posts.id,
            description: posts.description,
            imageData: posts.imageData,
            imageMimeType: posts.imageMimeType,
            createdAt: posts.createdAt,
          })
          .from(posts);

        return {
          success: true,
          data: allPosts,
        };
      } catch (err) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch data from database",
        };
      }
    },
    { beforeHandle: checkPermission(Permissions.READ_POST) },
  )

  .delete(
    "/:id",
    async ({ params, user, set }) => {
      try {
        const postId = parseInt(params.id);
        const [existingPost] = await db
          .select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);

        if (!existingPost) {
          set.status = 404;
          return { success: false, message: "Post not found" };
        }
        // 3. Execute Delete
        await db.delete(posts).where(eq(posts.id, postId));

        return {
          success: true,
          message: "Post deleted successfully",
        };
      } catch (err) {
        set.status = 500;
        return { success: false, message: "Database error during deletion" };
      }
    },
    {
      beforeHandle: checkPermission(Permissions.DELETE_POST),
      params: t.Object({
        id: t.String(),
      }),
    },
  )
 // server/posts/index.ts

.patch("/:id", async ({ params, body, set }) => {
    try {
      const postId = Number(params.id);
      if (isNaN(postId)) {
        set.status = 400;
        return { success: false, message: "Invalid ID format" };
      }

      // 1. FIX: Define the type properly to satisfy ESLint
      const updateData: Partial<typeof posts.$inferInsert> = {};
      
      if (body.description) updateData.description = body.description;
      if (body.imageData) updateData.imageData = body.imageData;
      if (body.mimeType) updateData.imageMimeType = body.mimeType;

      if (Object.keys(updateData).length === 0) {
        set.status = 400;
        return { success: false, message: "No fields provided" };
      }

      // 2. Execute Update
      const [updatedPost] = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, postId))
        .returning();

      if (!updatedPost) {
        set.status = 404;
        return { success: false, message: "Post not found" };
      }

      return { success: true, data: updatedPost };
    } catch (err) {
      console.error(err);
      set.status = 500;
      return { success: false, message: "Database error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      description: t.Optional(t.String({ minLength: 5 })),
      imageData: t.Optional(t.String()),
      mimeType: t.Optional(t.String())
    }),
    beforeHandle: checkPermission(Permissions.UPDATE_POST)
  })
