import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cartes = pgTable("cartes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titre: text("titre").notNull(),
  effet: text("effet").notNull(),
  categorie: text("categorie").notNull(),
  alignement: text("alignement").notNull(),
  visibilite_defaut: text("visibilite_defaut").notNull(),
  rarete: text("rarete"),
  comportement_revelation: text("comportement_revelation").notNull(),
  actif: boolean("actif").notNull().default(true),
  cree_a: timestamp("cree_a").defaultNow(),
  modifie_a: timestamp("modifie_a").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCarteSchema = createInsertSchema(cartes).omit({
  id: true,
  cree_a: true,
  modifie_a: true,
}).extend({
  titre: z.string().min(1, "Title is required"),
  effet: z.string().min(1, "Effect description is required"),
  categorie: z.enum(["basic", "special"]),
  alignement: z.enum(["blessed", "cursed"]),
  visibilite_defaut: z.enum(["face_up", "face_down"]),
  rarete: z.enum(["common", "uncommon", "rare"]).nullable(),
  comportement_revelation: z.enum(["on_view_owner", "on_steal_new_owner", "immediate"]),
  actif: z.boolean().default(true),
}).refine((data) => {
  // If categorie is "special", rarete must be null
  if (data.categorie === "special" && data.rarete !== null) {
    return false;
  }
  return true;
}, {
  message: "Rarity must be null for special cards",
  path: ["rarete"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Carte = typeof cartes.$inferSelect;
export type InsertCarte = z.infer<typeof insertCarteSchema>;
