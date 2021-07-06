import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import UUID from "./UUID";

export default class UUIDConverter implements IdConverter {
  convert(id: string): Id {
    return new UUID(id);
  }
}
