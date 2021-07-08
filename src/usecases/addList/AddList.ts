import Id from "../../domain/Id";
import List from "../../domain/List";
import ListDb from "../../dataAccess/ListDb";
import ServerError from "../ServerError";
import UserDb from "../../dataAccess/UserDb";
import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import InvalidListDataError from "./InvalidListDataError";
import UserNotFoundError from "./UserNotFoundError";
import IdCreator from "../../dataAccess/IdCreator";

export default function buildAddList({
  userDb,
  idCreator,
  listDb,
}: {
  userDb: UserDb;
  idCreator: IdCreator;
  listDb: ListDb;
}) {
  return class AddList {
    constructor(
      private data: {
        userId: Id;
        list: { title: string; description: string };
      }
    ) {}

    async execute() {
      await this.checkIfUserExists();
      const list = this.createList();
      await this.saveList(list);
      return { listId: list.id };
    }

    private async checkIfUserExists() {
      try {
        await userDb.getById(this.data.userId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new UserNotFoundError();
        else throw new ServerError();
      }
    }

    private createList() {
      try {
        return new List({
          id: idCreator.create(),
          authorId: this.data.userId,
          ...this.data.list,
        });
      } catch {
        throw new InvalidListDataError();
      }
    }

    private async saveList(list: List) {
      try {
        await listDb.save(list);
      } catch (e) {
        throw new ServerError();
      }
    }
  };
}
