import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ServerError from "../ServerError";

export default function buildDeleteListItem({ listDb }: { listDb: ListDb }) {
  return class DeleteListItem {
    constructor(private data: { listId: Id; listItemIndex: number }) {}
    async execute() {
      const list = (await this.getList())!;
      const index = this.data.listItemIndex;
      this.validateIndex(index, list);
      list.removeListItemAt(index);
      await this.saveList(list);
    }

    private async getList() {
      try {
        return await listDb.getById(this.data.listId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new Error("list not found");
        if (e instanceof DatabaseError)
          throw new ServerError("could not get the list");
      }
    }

    private async saveList(list: List) {
      try {
        await listDb.save(list);
      } catch (e) {
        if (e instanceof DatabaseError)
          throw new ServerError("could not save the changes");
      }
    }

    private validateIndex(index: number, list: List) {
      if (index < 0 || index >= list.length || !Number.isInteger(index))
        throw new Error(`no list item at index: ${index}`);
    }
  };
}
