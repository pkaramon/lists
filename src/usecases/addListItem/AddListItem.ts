import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";
import ListItemFactory from "./ListItemFactory";
import ListNotFoundError from "./ListNotFoundError";

export default function buildAddListItem({
  listDb,
  listItemFactory,
}: {
  listDb: ListDb;
  listItemFactory: ListItemFactory;
}) {
  return class AddListItem {
    constructor(private data: { userId: Id; listId: Id; listItem: any }) {}

    async execute() {
      const list = await this.getList();
      this.checkIfUserHasAccess(list);
      const listItem = listItemFactory.createListItem(this.data.listItem);
      list.addListItem(listItem);
      await this.saveModifiedList(list);
    }

    private async getList(): Promise<List> {
      try {
        return await listDb.getById(this.data.listId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new ListNotFoundError();
        else throw new ServerError("could not get list");
      }
    }

    private checkIfUserHasAccess(list: List) {
      if (!list.isUserAllowed(this.data.userId)) {
        throw new UserNoAccessError();
      }
    }

    private async saveModifiedList(list: List) {
      try {
        await listDb.save(list);
      } catch (e) {
        throw new ServerError("could not save");
      }
    }
  };
}
