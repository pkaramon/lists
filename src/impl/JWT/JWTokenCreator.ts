import TokenCreator from "../../auth/TokenCreator";
import Id from "../../domain/Id";
import jwt from "jsonwebtoken";

export default class JWTokenCreator implements TokenCreator {
  constructor(private privateKey: string) {}

  async create(userId: Id): Promise<string> {
    const id = userId.toString();
    return jwt.sign({ userId: id }, this.privateKey);
  }
}
