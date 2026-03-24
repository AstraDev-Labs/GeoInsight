import { getRequestContext } from '@cloudflare/next-on-pages';

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(column?: string): Promise<T | null>;
  run<T = any>(): Promise<D1Result<T>>;
  all<T = any>(): Promise<D1Result<T>>;
}

export interface D1Result<T = any> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

/**
 * Gets the D1 database binding.
 * In production (Cloudflare Pages), it uses the 'DB' binding.
 * In development, you might need to use a mock or the Wrangler local dev proxy.
 */
export function getDb(): D1Database {
  try {
    const context = getRequestContext();
    const db = (context.env as any).DB as D1Database;
    if (!db) {
      throw new Error('D1 binding "DB" not found in environment.');
    }
    return db;
  } catch (e) {
    console.error('Failed to get D1 database context:', e);
    throw new Error('Cloudflare D1 environment not initialized.');
  }
}
