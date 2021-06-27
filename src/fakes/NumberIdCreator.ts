import { IdCreator } from "../usecases/addUser/AddUser";
import NumberId from "./NumberId";

export default class NumberIdCreator implements IdCreator {
  count = 0;
  create() {
    return new NumberId(++this.count);
  }
}
