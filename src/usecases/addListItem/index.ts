import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ListItemGateway from "../../domain/ListItemGateway";
import ListRelatedAction from "../ListRelatedAction";

export default function buildAddListItem({
  listDb,
  listItemGateway: listItemFactory,
}: {
  listDb: ListDb;
  listItemGateway: ListItemGateway;
}) {
  return class AddListItem extends ListRelatedAction {
    constructor(private data: { userId: Id; listId: Id; listItem: any }) {
      super(data.userId, data.listId, listDb);
    }

    protected perform(list: List) {
      const listItem = listItemFactory.fromDataToObject(this.data.listItem);
      list.addListItem(listItem);
      return this.saveList(list)
    }
  };
}
