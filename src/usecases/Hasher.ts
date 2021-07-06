export default interface Hasher {
  hash(str: string): Promise<string>;
  compare(notHashed: string, hashed: string): Promise<boolean>;
}
