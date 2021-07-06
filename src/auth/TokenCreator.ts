import Id from "../domain/Id";

export default interface TokenCreator {
  create(userId: Id): Promise<string>;
}

