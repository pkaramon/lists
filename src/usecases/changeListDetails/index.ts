import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import InvalidListDataError from "../InvalidListDataError";
import ListRelatedAction from "../ListRelatedAction";

export default function buildChangeListDetails({ listDb }: { listDb: ListDb }) {
  return class ChangeListDetails extends ListRelatedAction {
    constructor(
      private data: {
        userId: Id;
        listId: Id;
        listDetails: { title?: string; description?: string };
      }
    ) {
      super(data.userId, data.listId, listDb);
    }

    protected async perform(list: List) {
      const title = this.data.listDetails.title ?? list.title;
      const description = this.data.listDetails.description ?? list.description;
      this.tryToChangeListDetails(list, title, description);
      await this.saveList(list);
    }

    private tryToChangeListDetails(
      list: List,
      title: string,
      description: string
    ) {
      try {
        list.changeTitle(title);
        list.changeDescription(description);
      } catch {
        throw new InvalidListDataError();
      }
    }
  };
}
