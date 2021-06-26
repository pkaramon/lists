export default interface Id {
  equals(other: Id): boolean;
  toPrimitive(): any;
}
