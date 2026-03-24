import { getRequestContext } from '@cloudflare/next-on-pages';

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
  error?: string;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

class HttpD1PreparedStatement implements D1PreparedStatement {
  constructor(
    private db: HttpD1Database,
    private query: string,
    private params: unknown[] = []
  ) {}

  bind(...values: unknown[]): D1PreparedStatement {
    return new HttpD1PreparedStatement(this.db, this.query, values);
  }

  async first<T = unknown>(column?: string): Promise<T | null> {
    const res = await this.db.execute([{ sql: this.query, params: this.params }]);
    const results = res[0].results;
    if (!results || results.length === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = results[0] as any;
    if (column && Object.prototype.hasOwnProperty.call(row, column)) {
      return row[column] as T;
    }
    return row as T;
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    const res = await this.db.execute([{ sql: this.query, params: this.params }]);
    return res[0] as D1Result<T>;
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const res = await this.db.execute([{ sql: this.query, params: this.params }]);
    return res[0] as D1Result<T>;
  }

  _getStatement() {
    return { sql: this.query, params: this.params };
  }
}

class HttpD1Database implements D1Database {
  constructor(
    private accountId: string,
    private dbId: string,
    private token: string
  ) {}

  prepare(query: string): D1PreparedStatement {
    return new HttpD1PreparedStatement(this, query);
  }

  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    const payloads = statements.map(s => (s as HttpD1PreparedStatement)._getStatement());
    return await this.execute(payloads);
  }

  async exec(query: string): Promise<D1ExecResult> {
    const res = await this.execute([{ sql: query }]);
    const firstObj = res[0];
    return { count: firstObj.meta?.changes || 0, duration: firstObj.meta?.duration || 0 };
  }

  async execute(statements: {sql: string, params?: unknown[]}[]): Promise<D1Result[]> {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statements)
    });

    const data = await response.json() as { success: boolean, result: D1Result[], errors: Array<{message: string}> };
    if (!data.success) {
        let msg = "Cloudflare D1 HTTP Error";
        if (data.errors && data.errors.length > 0) {
            msg = data.errors.map(e => e.message).join(", ");
        }
        throw new Error(`D1 API Error: ${msg}`);
    }

    return data.result;
  }
}

/**
 * Gets the D1 database binding.
 * In Vercel or Node environments, relies on CLOUDFLARE_* HTTP API variables.
 * In Cloudflare Pages, natively falls back to the 'DB' binding context.
 */
export function getDb(): D1Database {
  // 1. HTTP Connection (Vercel)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && dbId && apiToken) {
    return new HttpD1Database(accountId, dbId, apiToken);
  }

  // 2. Native Binding (Cloudflare Pages fallback)
  try {
    const context = getRequestContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (context.env as any).DB as D1Database;
    if (!db) {
      throw new Error('D1 binding "DB" not found in environment.');
    }
    return db;
  } catch (e) {
    console.error('Failed to get D1 database context:', e);
    throw new Error('Cloudflare D1 environment not initialized. You must set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, and CLOUDFLARE_API_TOKEN in Vercel to use D1.');
  }
}
