import { Hasher } from "../addUser/AddUser";

export default class FakeHasher implements Hasher {
  async hash(str: string): Promise<string> {
    return `###${str}###`;
  }
}
