import Id from "../domain/Id";

export default interface IdCreator {
  create(): Id;
}
