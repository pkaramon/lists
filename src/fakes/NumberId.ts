import Id from "../domain/Id";

export default class NumberId implements Id {
  constructor(private n: number) {}

  equals(other: Id): boolean {
    return other instanceof NumberId && other.n === this.n;
  }

  toString() {
    return String(this.n);
  }
}
