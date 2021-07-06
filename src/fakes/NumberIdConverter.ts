import IdConverter from "../dataAccess/IdConverter";
import Id from "../domain/Id";
import NumberId from "./NumberId";

export default class NumberIdConverter implements IdConverter {
  convert(id: string): Id {
    return new NumberId(Number(id));
  }
}
