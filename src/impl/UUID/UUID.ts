import Id from "../../domain/Id";

export default class UUID implements Id {
  constructor(private id: string) {}
  equals(other: Id): boolean {
    return other instanceof UUID && other.id === this.id;
  }

  toString() {
    return this.id;
  }
}
