import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ListNotFoundError from "../ListNotFoundError";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";

export default function buildDeleteList({ listDb }: { listDb: ListDb }) {
  return class DeleteList {
    constructor(private data: { userId: Id; listId: Id }) {}

    async execute() {
      try {
        await this.tryToDeleteList();
      } catch (e) {
        this.handleErrors(e);
      }
    }

    private async tryToDeleteList() {
      const list = await listDb.getById(this.data.listId);
      this.checkIfUserHasAccess(list);
      await listDb.deleteById(this.data.listId);
    }

    private checkIfUserHasAccess(list: List) {
      if (!list.isUserAllowed(this.data.userId)) throw new UserNoAccessError();
    }

    private handleErrors(error: any) {
      if (error instanceof NotFoundError) throw new ListNotFoundError();
      if (error instanceof DatabaseError) throw new ServerError();
      if (error instanceof UserNoAccessError) throw error;
    }
  };
}
