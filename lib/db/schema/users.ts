import { index, pgTable, text, varchar, timestamp, json, boolean, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';

// Interface pro user roles
export interface UserRole {
  name: string;
}

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    casdoorId: varchar('casdoor_id', { length: 191 })
      .notNull()
      .unique(),
    casdoorToken: text('casdoor_token'),
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at'),
    roles: json('roles')
      .notNull()
      .default([])
      .$type<UserRole[]>(),
    tokenBalance: integer('token_balance')
      .notNull()
      .default(0),
    isActive: boolean('is_active')
      .notNull()
      .default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  table => ({
    casdoorIdIndex: index('users_casdoor_id_idx').on(table.casdoorId),
    createdAtIndex: index('users_created_at_idx').on(table.createdAt),
    isActiveIndex: index('users_is_active_idx').on(table.isActive),
  }),
);

// Types
export type User = typeof users.$inferSelect;
export type NewUserParams = {
  casdoorId: string;
  casdoorToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  roles?: UserRole[];
  tokenBalance?: number;
};
export type UpdateUserParams = {
  casdoorToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  roles?: UserRole[];
  tokenBalance?: number;
  isActive?: boolean;
  lastLoginAt?: Date;
};
