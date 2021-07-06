import Id from "../../domain/Id";
import { randomUUID } from "crypto";
import IdCreator from "../../dataAccess/IdCreator";
import UUID from "./UUID";

export default class UUIDCreator implements IdCreator {
  create(): Id {
    return new UUID(randomUUID());
  }
}
