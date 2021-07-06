import Hasher from "../../usecases/Hasher";
import bcrypt from "bcrypt";

export default class BcryptHasher implements Hasher {
  constructor(private saltRounds: number) {}
  async compare(notHashed: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(notHashed, hashed);
  }

  async hash(str: string): Promise<string> {
    return await bcrypt.hash(str, this.saltRounds);
  }
}
