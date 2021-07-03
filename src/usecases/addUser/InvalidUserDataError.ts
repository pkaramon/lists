import InvalidLoginDataError from "../../httpControllers/login/InvalidLoginDataError";

export default class InvalidUserDataError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidLoginDataError.name;
  }
}
