export interface RetryOptions {
  retries: number;
  baseDelayMs?: number;
}

function isRetryableError(error: unknown): boolean {
  const anyError = error as { code?: string; response?: { status?: number } };
  const status = anyError?.response?.status;
  if (status && status >= 500) return true;
  return ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN'].includes(String(anyError?.code || ''));
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const retries = Math.max(0, options.retries);
  const baseDelayMs = options.baseDelayMs ?? 300;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableError(error)) {
        throw error;
      }
      const backoff = baseDelayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw lastError;
}
