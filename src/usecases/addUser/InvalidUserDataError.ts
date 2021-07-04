export default class InvalidUserDataError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidUserDataError.name;
  }
}
