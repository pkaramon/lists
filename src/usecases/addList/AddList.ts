import Id from "../../model/Id";
import List from "../../model/List";
import { IdCreator } from "../addUser/AddUser";
import ListDb from "../ListDb";
import ServerError from "../ServerError";
import UserDb, { DatabaseError, NotFoundError } from "../UserDb";

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
        if (e instanceof NotFoundError) throw new Error("user not found");
        if (e instanceof DatabaseError) throw new ServerError("server error");
      }
    }

    private createList() {
      return new List({
        id: idCreator.create(),
        authorId: this.data.userId,
        ...this.data.list,
      });
    }

    private async saveList(list: List) {
      try {
        await listDb.save(list);
      } catch (e) {
        if (e instanceof DatabaseError) throw new ServerError("server error");
      }
    }
  };
}
