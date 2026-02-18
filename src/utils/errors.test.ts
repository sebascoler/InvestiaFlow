import { describe, it, expect } from 'vitest';
import {
  AppError,
  AuthError,
  PermissionError,
  NetworkError,
  ValidationError,
  NotFoundError,
  getErrorMessage,
} from './errors';

describe('Custom Error Classes', () => {
  it('AppError has name and userMessage', () => {
    const err = new AppError('internal detail', 'Something went wrong');
    expect(err.name).toBe('AppError');
    expect(err.message).toBe('internal detail');
    expect(err.userMessage).toBe('Something went wrong');
    expect(err instanceof Error).toBe(true);
  });

  it('AppError defaults userMessage to message', () => {
    const err = new AppError('same message');
    expect(err.userMessage).toBe('same message');
  });

  it('AuthError has default userMessage', () => {
    const err = new AuthError('firebase/wrong-password');
    expect(err.name).toBe('AuthError');
    expect(err.userMessage).toBe('Authentication failed. Please try again.');
  });

  it('PermissionError has default userMessage', () => {
    const err = new PermissionError('firestore permission denied');
    expect(err.name).toBe('PermissionError');
    expect(err.userMessage).toContain('permission');
  });

  it('NetworkError has default userMessage', () => {
    const err = new NetworkError('Failed to fetch');
    expect(err.name).toBe('NetworkError');
    expect(err.userMessage).toContain('Connection error');
  });

  it('ValidationError includes field info', () => {
    const err = new ValidationError('Email is required', 'email');
    expect(err.name).toBe('ValidationError');
    expect(err.field).toBe('email');
    expect(err.userMessage).toBe('Email is required');
  });

  it('NotFoundError formats resource name', () => {
    const err = new NotFoundError('Lead', 'lead-123');
    expect(err.name).toBe('NotFoundError');
    expect(err.message).toContain('lead-123');
    expect(err.userMessage).toContain('Lead not found');
  });
});

describe('getErrorMessage', () => {
  it('returns userMessage for AppError', () => {
    expect(getErrorMessage(new AuthError('code'))).toBe('Authentication failed. Please try again.');
    expect(getErrorMessage(new PermissionError('x'))).toContain('permission');
    expect(getErrorMessage(new NetworkError('x'))).toContain('Connection error');
  });

  it('maps Firebase permission errors', () => {
    expect(getErrorMessage(new Error('permission-denied'))).toContain('permission');
  });

  it('maps network errors', () => {
    expect(getErrorMessage(new Error('Failed to fetch'))).toContain('Connection error');
  });

  it('returns message for plain Error', () => {
    expect(getErrorMessage(new Error('custom msg'))).toBe('custom msg');
  });

  it('returns fallback for non-Error', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred. Please try again.');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
  });
});
