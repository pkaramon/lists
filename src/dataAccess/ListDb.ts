import Id from "../domain/Id";
import List from "../domain/List";

export default interface ListDb {
  save(list: List): Promise<void>;
  getById(id: Id): Promise<List>;
}
