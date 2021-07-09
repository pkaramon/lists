import ListItem from "../ListItem";

export default class ListItemsContainer {
  private listItems: ListItem[] = [];

  add(li: ListItem) {
    this.listItems.push(li);
  }

  removeAt(index: number) {
    this.validateIndex(index);
    this.listItems.splice(index, 1);
  }

  getAt(index: number) {
    this.validateIndex(index);
    return this.listItems[index];
  }

  get length() {
    return this.listItems.length;
  }

  [Symbol.iterator]() {
    return this.listItems[Symbol.iterator]();
  }

  private validateIndex(index: number) {
    if (index < 0 || index >= this.length || !Number.isInteger(index))
      throw new RangeError(`invalid index: ${index}`);
  }
}
