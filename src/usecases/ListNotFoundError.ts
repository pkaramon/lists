export default class ListNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = ListNotFoundError.name;
  }
}
