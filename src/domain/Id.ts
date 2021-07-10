export default abstract class Id {
  abstract equals(other: Id): boolean;
  abstract toString(): string;
}
