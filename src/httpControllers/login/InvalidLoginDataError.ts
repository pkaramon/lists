export default class InvalidLoginDataError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidLoginDataError.name;
  }
}
