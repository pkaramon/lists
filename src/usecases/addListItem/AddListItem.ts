import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ListItem from "../../domain/ListItem";
import ServerError from "../ServerError";

export interface ListItemFactory {
  createListItem(data: any): ListItem;
}

export default function buildAddListItem({
  listDb,
  listItemFactory,
}: {
  listDb: ListDb;
  listItemFactory: ListItemFactory;
}) {
  return class AddListItem {
    constructor(private data: { listId: Id; listItem: any }) {}

    async execute() {
      const list = await this.getList();
      const listItem = listItemFactory.createListItem(this.data.listItem);
      list.addListItem(listItem);
      await this.saveModifiedList(list);
    }

    private async getList() {
      try {
        return await listDb.getById(this.data.listId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new Error("list not found");
        if (e instanceof DatabaseError)
          throw new ServerError("could not get list");
        throw e;
      }
    }

    private async saveModifiedList(list: List) {
      try {
        await listDb.save(list);
      } catch (e) {
        if (e instanceof DatabaseError) throw new ServerError("could not save");
        throw e;
      }
    }
  };
}
