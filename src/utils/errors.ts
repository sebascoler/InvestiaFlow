/**
 * Custom error classes for better error handling and user-facing messages.
 */

/**
 * Base application error with a user-friendly message.
 */
export class AppError extends Error {
  public readonly userMessage: string;

  constructor(message: string, userMessage?: string) {
    super(message);
    this.name = 'AppError';
    this.userMessage = userMessage || message;
  }
}

/**
 * Authentication-related errors (login, signup, logout, session).
 */
export class AuthError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, userMessage || 'Authentication failed. Please try again.');
    this.name = 'AuthError';
  }
}

/**
 * Permission/authorization errors (user lacks access).
 */
export class PermissionError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, userMessage || 'You don\'t have permission to perform this action.');
    this.name = 'PermissionError';
  }
}

/**
 * Network/connectivity errors (API calls, Firebase, etc).
 */
export class NetworkError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, userMessage || 'Connection error. Please check your internet and try again.');
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors (form inputs, data integrity).
 */
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string, userMessage?: string) {
    super(message, userMessage || message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Resource not found errors (lead, document, team, etc).
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
    super(msg, `${resource} not found. It may have been deleted.`);
    this.name = 'NotFoundError';
  }
}

/**
 * Extract a user-friendly error message from any caught error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    // Map common Firebase error codes to user-friendly messages
    const msg = error.message;
    if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
      return 'You don\'t have permission to perform this action.';
    }
    if (msg.includes('not-found') || msg.includes('NOT_FOUND')) {
      return 'The requested resource was not found.';
    }
    if (msg.includes('unavailable') || msg.includes('UNAVAILABLE')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (msg.includes('unauthenticated') || msg.includes('UNAUTHENTICATED')) {
      return 'Please log in to continue.';
    }
    if (msg.includes('network') || msg.includes('Failed to fetch')) {
      return 'Connection error. Please check your internet and try again.';
    }
    return msg;
  }
  return 'An unexpected error occurred. Please try again.';
}
