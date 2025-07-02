import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scores = pgTable('scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  score: integer('score').notNull(),
  environment: text('environment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gameSettings = pgTable('game_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  musicEnabled: boolean('music_enabled').default(true).notNull(),
  soundEnabled: boolean('sound_enabled').default(true).notNull(),
  difficulty: text('difficulty').default('normal').notNull(),
});