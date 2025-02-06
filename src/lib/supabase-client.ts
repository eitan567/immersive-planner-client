/// <reference lib="dom" />
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

// Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Reuse a single Supabase client instance across the app
if (!(globalThis as any).__supabase) {
  (globalThis as any).__supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = (globalThis as any).__supabase

// Type helpers
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;

// Error handling
export class SupabaseError extends Error {
  constructor(message: string, public details: unknown = null) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export const handleError = (error: Error): never => {
  console.error('Supabase operation failed:', error);
  throw new SupabaseError(
    'Operation failed',
    error instanceof Error ? error.message : 'Unknown error'
  );
};

/**
 * Type-safe database query wrapper
 * @param operation - Function that performs the database operation
 * @returns Result of the operation
 */
export async function dbOperation<T>(
  operation: (client: SupabaseClient<Database>) => Promise<T>
): Promise<T> {
  try {
    return await operation(supabase);
  } catch (error) {
    return handleError(error as Error);
  }
}

// Export user type
export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];