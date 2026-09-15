export class AppError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.cause = cause;
  }
}

export function normalizeError(context: string, error: unknown): AppError {
  const anyError = error as { message?: string; response?: { status?: number; data?: unknown } };
  const status = anyError?.response?.status;
  const detail = anyError?.message || 'unknown error';

  if (status) {
    return new AppError(`${context}: HTTP ${status} (${detail})`, error);
  }
  return new AppError(`${context}: ${detail}`, error);
}
