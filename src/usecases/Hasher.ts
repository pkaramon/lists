export default interface Hasher {
  hash(str: string): Promise<string>;
}

