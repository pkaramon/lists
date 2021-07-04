export default class InvalidListItemIndexError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidListItemIndexError.name;
  }
}
