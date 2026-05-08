import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  pgEnum, 
  customType, 
  integer 
} from "drizzle-orm/pg-core";

// 1. Define the User Roles
export const roleEnum = pgEnum("user_role", ["ADMIN", "EDITOR", "USER"]);


// 3. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(), // 👈 Add this line to hold the argon2 hash
  role: roleEnum("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Posts Table (Direct Image Storage)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  
  // Storage for the image binary and its type (jpg, png, etc.)
  imageData: text("image_data").notNull(),
  imageMimeType: varchar("image_mime_type", { length: 50 }).notNull(), 
  
  description: text("description").notNull(),
  
  // Role-based tracking
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }),
  updatedBy: integer("updated_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});