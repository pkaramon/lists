export default class InvalidListItemIndex extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidListItemIndex.name;
  }
}
