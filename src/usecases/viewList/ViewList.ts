import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";

export default function buildViewList({ listDb }: { listDb: ListDb }) {
  return class ViewList {
    constructor(private data: { listId: Id }) {}
    async execute() {
      const list = await this.getList();
      return {
        title: list.title,
        description: list.description,
        length: list.length,
        listItems: this.getDataObjects(list),
      };
    }

    private async getList() {
      try {
        return await listDb.getById(this.data.listId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new Error("list not found");
        if (e instanceof DatabaseError)
          throw new Error("could not view the list");
        else throw e;
      }
    }

    private getDataObjects(list: List) {
      const dataObjects = [];
      for (const listItem of list) {
        dataObjects.push(listItem.toDataObject());
      }
      return dataObjects;
    }
  };
}
