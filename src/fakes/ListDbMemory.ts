import Id from "../domain/Id";
import List from "../domain/List";
import ListDb from "../dataAccess/ListDb";
import NotFoundError from "../dataAccess/NotFoundError";

export default class ListDbMemory implements ListDb {
  lists = new Map<string, List>();

  async save(list: List): Promise<void> {
    this.lists.set(list.id.toString(), list);
  }

  async getById(id: Id): Promise<List> {
    const list = this.lists.get(id.toString());
    if (list === undefined)
      throw new NotFoundError("list with that id does not exist");
    return list;
  }

  async deleteById(id: Id): Promise<void> {
    const list = this.lists.get(id.toString());
    if (list === undefined)
      throw new NotFoundError("list with that id does not exist");
    this.lists.delete(id.toString());
  }

  async getListsMadeBy(authorId: Id) {
    const allLists = Array.from(this.lists.values());
    return allLists.filter((list) => list.authorId.equals(authorId));
  }
}
