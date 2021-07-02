export default class EmailAlreadyTakenError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = EmailAlreadyTakenError.name;
  }
}
