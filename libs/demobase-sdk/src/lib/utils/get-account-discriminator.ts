import { sha256 } from 'js-sha256';

export function getAccountDiscriminator(name: string): Buffer {
  return Buffer.from(sha256.digest(`account:${name}`)).slice(0, 8);
}
