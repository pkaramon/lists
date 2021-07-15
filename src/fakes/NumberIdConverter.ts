import IdConverter from "../dataAccess/IdConverter";
import NumberId from "./NumberId";

export default class NumberIdConverter implements IdConverter {
  convert(id: string): NumberId {
    return new NumberId(Number(id));
  }
}
