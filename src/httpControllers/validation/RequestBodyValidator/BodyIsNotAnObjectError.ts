export default class BodyIsNotAnObjectError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = BodyIsNotAnObjectError.name;
  }
}
