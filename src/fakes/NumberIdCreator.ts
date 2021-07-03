import IdCreator from "../dataAccess/IdCreator";
import NumberId from "./NumberId";

export default class NumberIdCreator implements IdCreator {
  count = 0;
  create() {
    return new NumberId(++this.count);
  }
}
