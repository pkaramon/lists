export default class InvalidListDataError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidListDataError.name;
  }
}
