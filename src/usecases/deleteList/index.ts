import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ListNotFoundError from "../ListNotFoundError";
import ListRelatedAction from "../ListRelatedAction";
import ServerError from "../ServerError";

export default function buildDeleteList({ listDb }: { listDb: ListDb }) {
  return class DeleteList extends ListRelatedAction {
    constructor(data: { userId: Id; listId: Id }) {
      super(data.userId, data.listId, listDb);
    }

    protected async perform(list: List) {
      try {
        await listDb.deleteById(list.id);
      } catch (e) {
        if (e instanceof NotFoundError) throw new ListNotFoundError();
        if (e instanceof DatabaseError) throw new ServerError();
      }
    }
  };
}
