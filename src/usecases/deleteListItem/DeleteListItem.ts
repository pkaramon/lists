import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import InvalidListItemIndexError from "../InvalidListItemIndexError";
import ListNotFoundError from "../ListNotFoundError";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";

export default function buildDeleteListItem({ listDb }: { listDb: ListDb }) {
  return class DeleteListItem {
    constructor(
      private data: { userId: Id; listId: Id; listItemIndex: number }
    ) {}

    async execute() {
      const list = await this.getList();
      this.checkIfUserHasAccess(list);
      this.tryToRemoveListItem(list);
      await this.saveList(list);
    }

    private async getList() {
      try {
        return await listDb.getById(this.data.listId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new ListNotFoundError();
        else throw new ServerError("could not get the list");
      }
    }

    private checkIfUserHasAccess(list: List) {
      if (!list.isUserAllowed(this.data.userId)) {
        throw new UserNoAccessError();
      }
    }

    private tryToRemoveListItem(list: List) {
      const i = this.data.listItemIndex;
      try {
        list.removeListItemAt(i);
      } catch (e) {
        throw new InvalidListItemIndexError();
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
  };
}
