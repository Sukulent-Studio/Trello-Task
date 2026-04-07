import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// ==== TABLES ====

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  second_name: varchar('second_name', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  column_id: integer('column_id')
    .notNull()
    .references(() => columns.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  card_id: integer('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  author_id: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ==== RELATIONS ====

export const userRelations = relations(users, ({ many }) => ({
  columns: many(columns),
  cards: many(cards),
  comments: many(comments),
}));

export const columnRelations = relations(columns, ({ one, many }) => ({
  user: one(users, {
    fields: [columns.user_id],
    references: [users.id],
  }),
  cards: many(cards),
}));

export const cardRelations = relations(cards, ({ one, many }) => ({
  column: one(columns, {
    fields: [cards.column_id],
    references: [columns.id],
  }),
  comments: many(comments),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
  }),
  card: one(cards, {
    fields: [comments.card_id],
    references: [cards.id],
  }),
}));

// ==== TYPES ====

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = Omit<User, 'password'>;

export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

// ==== FIELDS ====

export const usersPublicFields = {
  id: users.id,
  email: users.email,
  first_name: users.first_name,
  second_name: users.second_name,
  created_at: users.created_at,
  updated_at: users.updated_at,
} as const;
