import Id from "../domain/Id";
import List from "../domain/List";
import ListDb from "../dataAccess/ListDb";
import NotFoundError from "../dataAccess/NotFoundError";

export default class ListDbMemory implements ListDb {
  lists = new Map<string | number, List>();

  async save(list: List): Promise<void> {
    this.lists.set(list.id.toPrimitive(), list);
  }
  async getById(id: Id): Promise<List> {
    const list = this.lists.get(id.toPrimitive());
    if (list === undefined)
      throw new NotFoundError("list with that id does not exist");
    return list;
  }
}
