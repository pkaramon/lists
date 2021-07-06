import Hasher from "../usecases/Hasher";

export default class FakeHasher implements Hasher {
  async hash(str: string): Promise<string> {
    return `###${str}###`;
  }

  async compare(notHashed: string, hashed: string): Promise<boolean> {
    return (await this.hash(notHashed)) === hashed;
  }
}
