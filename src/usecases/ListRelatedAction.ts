import ListDb from "../dataAccess/ListDb";
import NotFoundError from "../dataAccess/NotFoundError";
import Id from "../domain/Id";
import List from "../domain/List";
import ListNotFoundError from "./ListNotFoundError";
import ServerError from "./ServerError";
import UserNoAccessError from "./UserNoAccessError";

export default abstract class ListRelatedAction {
  constructor(private userId: Id, private listId: Id, private listDb: ListDb) {}

  /*final*/ async execute() {
    const list = await this.getList();
    this.checkIfUserHasAccess(list);
    const result = await this.perform(list);
    await this.saveList(list);
    return result;
  }

  private async getList() {
    try {
      return await this.listDb.getById(this.listId);
    } catch (e) {
      if (e instanceof NotFoundError) throw new ListNotFoundError();
      else throw new ServerError("could not get the list");
    }
  }

  private checkIfUserHasAccess(list: List) {
    if (!list.isUserAllowed(this.userId)) throw new UserNoAccessError();
  }

  protected abstract perform(list: List): any | Promise<any>;

  private async saveList(list: List) {
    try {
      await this.listDb.save(list);
    } catch (e) {
      throw new ServerError("could not save the changes");
    }
  }
}
