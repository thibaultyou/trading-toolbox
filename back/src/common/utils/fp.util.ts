// TODO ensure that import { toError } from 'fp-ts/lib/Either' has the same definition
export const toError = (error: unknown): Error => (error instanceof Error ? error : new Error('Unknown error'));
