import bcryptjs from 'bcryptjs';

const ROUNDS = 12; // ~300 ms per hash on modern hardware; deliberately slow

export function hashPassword(plain: string): Promise<string> {
  return bcryptjs.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(plain, hash);
}
