import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ListItemGateway from "../../domain/ListItemGateway";
import ListRelatedAction from "../ListRelatedAction";

export default function buildViewList({
  listDb,
  listItemGateway,
}: {
  listDb: ListDb;
  listItemGateway: ListItemGateway;
}) {
  return class ViewList extends ListRelatedAction {
    constructor(data: { userId: Id; listId: Id }) {
      super(data.userId, data.listId, listDb);
    }

    protected perform(list: List) {
      return {
        title: list.title,
        description: list.description,
        length: list.length,
        listItems: this.getListItemsData(list),
      };
    }

    private getListItemsData(list: List) {
      const listItemsData = [];
      for (const listItem of list)
        listItemsData.push(listItemGateway.fromObjectToData(listItem));
      return listItemsData;
    }
  };
}
