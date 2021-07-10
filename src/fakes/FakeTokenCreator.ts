import TokenCreator from "../auth/TokenCreator";
import Id from "../domain/Id";

export default class FakeTokenCreator implements TokenCreator {
  async create(userId: Id): Promise<string> {
    return `###${userId.toString()}###`;
  }
}
