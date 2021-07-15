import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ServerError from "../ServerError";

export default function buildGetLists({ listDb }: { listDb: ListDb }) {
  return class GetLists {
    constructor(private data: { userId: Id }) {}
    async execute() {
      const lists = await this.tryToGetLists();
      const listsView = this.createListsView(lists);
      return { lists: listsView };
    }

    private async tryToGetLists() {
      try {
        return await listDb.getListsMadeBy(this.data.userId);
      } catch (e) {
        throw new ServerError();
      }
    }

    private createListsView(lists: List[]) {
      return lists.map((list) => ({
        id: list.id,
        title: list.title,
        description: list.description,
      }));
    }
  };
}
