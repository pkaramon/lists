import Id from "../model/Id";
import { TokenCreator } from "../usecases/login/Login";

export default class FakeTokenCreator implements TokenCreator {
  async create(userId: Id): Promise<string> {
    return `###${userId.toPrimitive()}###`;
  }
}
