import Id from "../domain/Id";

export default interface IdConverter {
  convert(id: string | number): Id;
}
