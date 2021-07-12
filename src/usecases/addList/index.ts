import Id from "../../domain/Id";
import List from "../../domain/List";
import ListDb from "../../dataAccess/ListDb";
import ServerError from "../ServerError";
import UserDb from "../../dataAccess/UserDb";
import InvalidListDataError from "../InvalidListDataError";
import IdCreator from "../../dataAccess/IdCreator";

export default function buildAddList({
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
      const list = this.createList();
      await this.saveList(list);
      return { listId: list.id };
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
