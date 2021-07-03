import IdConverter from "../dataAccess/IdConverter";
import Id from "../domain/Id";
import NumberId from "./NumberId";

export default class FakeIdConverter implements IdConverter {
  convert(id: string | number): Id {
    return new NumberId(Number(id));
  }
}
