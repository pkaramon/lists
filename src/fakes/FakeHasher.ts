import Hasher from "../usecases/Hasher";

export default class FakeHasher implements Hasher {
  async hash(str: string): Promise<string> {
    return `###${str}###`;
  }
}
