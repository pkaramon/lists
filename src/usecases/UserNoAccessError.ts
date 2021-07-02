export default class UserNoAccessError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = UserNoAccessError.name;
  }
}
