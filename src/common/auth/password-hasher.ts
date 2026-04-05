import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function hashSecret(secret: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(secret, salt, KEY_LENGTH).toString("hex");

  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

export function verifySecret(secret: string, storedHash: string): boolean {
  const [prefix, salt, expectedKey] = storedHash.split("$");

  if (prefix !== HASH_PREFIX || !salt || !expectedKey) {
    return false;
  }

  const actualKey = scryptSync(secret, salt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedKey, "hex");

  if (actualKey.byteLength !== expectedBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(actualKey, expectedBuffer);
}

@Injectable()
export class PasswordHasher {
  hash(secret: string): string {
    return hashSecret(secret);
  }

  verify(secret: string, storedHash: string): boolean {
    return verifySecret(secret, storedHash);
  }
}
