export function failAdmin(message: string): never {
  throw new Error(message);
}
