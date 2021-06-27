import Id from "../model/Id";
import List from "../model/List";

export default interface ListDb {
  save(list: List): Promise<void>;
  getById(id: Id): Promise<List>;
}
