import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import InvalidListItemIndexError from "../InvalidListItemIndexError";
import ListRelatedAction from "../ListRelatedAction";

export default function buildDeleteListItem({ listDb }: { listDb: ListDb }) {
  return class DeleteListItem extends ListRelatedAction {
    constructor(
      private data: { userId: Id; listId: Id; listItemIndex: number }
    ) {
      super(data.userId, data.listId, listDb);
    }

    protected perform(list: List) {
      try {
        list.removeListItemAt(this.data.listItemIndex);
      } catch {
        throw new InvalidListItemIndexError();
      }
    }
  };
}
