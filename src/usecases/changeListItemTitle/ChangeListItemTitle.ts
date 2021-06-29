import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";

export default function buildChangeListItemTitle({
  listDb,
}: {
  listDb: ListDb;
}) {
  return class ChangeListItemTitle {
    constructor(
      private data: {
        listId: Id;
        listItemIndex: number;
        title: string;
      }
    ) {}

    async execute() {
      const list = await this.getList();
      const listItem = this.getListItem(list);
      listItem.changeTitle(this.data.title);
      await this.saveChanges(list);
    }

    private async saveChanges(list: List) {
      try {
        await listDb.save(list);
      } catch (e) {
        if (e instanceof DatabaseError)
          throw new Error("could not save changes");
      }
    }

    private async getList() {
      try {
        return await listDb.getById(this.data.listId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new Error("list not found");
        else if (e instanceof DatabaseError)
          throw new Error("could not get the list");
        else throw e;
      }
    }

    private getListItem(list: List) {
      try {
        return list.getListItemAt(this.data.listItemIndex);
      } catch (e) {
        if (e instanceof RangeError)
          throw new Error(`no list item at index: ${this.data.listItemIndex}`);
        else throw e;
      }
    }
  };
}