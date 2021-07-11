import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import InvalidListItemIndexError from "../InvalidListItemIndexError";
import ListRelatedAction from "../ListRelatedAction";

export default function buildChangeListItemTitle({
  listDb,
}: {
  listDb: ListDb;
}) {
  return class ChangeListItemTitle extends ListRelatedAction {
    constructor(
      private data: {
        userId: Id;
        listId: Id;
        listItemIndex: number;
        title: string;
      }
    ) {
      super(data.userId, data.listId, listDb);
    }

    protected perform(list: List) {
      const listItem = this.getListItem(list);
      listItem.changeTitle(this.data.title);
      return this.saveList(list)
    }

    private getListItem(list: List) {
      try {
        return list.getListItemAt(this.data.listItemIndex);
      } catch {
        throw new InvalidListItemIndexError(
          `no list item at index: ${this.data.listItemIndex}`
        );
      }
    }
  };
}
