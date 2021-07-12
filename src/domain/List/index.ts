import Id from "../Id";
import ListItem from "../ListItem";
import ValidationError from "../ValidationError";
import ListItemsContainer from "./ListItemsContainer";

export default class List {
  private listItems = new ListItemsContainer();

  constructor(
    private data: { id: Id; authorId: Id; title: string; description: string }
  ) {
    this.cleanData();
    this.validateTitle(data.title);
  }

  get id() {
    return this.data.id;
  }

  get authorId() {
    return this.data.authorId;
  }

  get title() {
    return this.data.title;
  }

  get description() {
    return this.data.description;
  }

  get length() {
    return this.listItems.length;
  }

  [Symbol.iterator]() {
    return this.listItems[Symbol.iterator]();
  }

  isUserAllowed(userId: Id) {
    return this.authorId.equals(userId);
  }

  addListItem(li: ListItem) {
    this.listItems.add(li);
  }

  removeListItemAt(index: number) {
    this.listItems.removeAt(index);
  }

  getListItemAt(index: number) {
    return this.listItems.getAt(index);
  }

  changeTitle(newTitle: string) {
    this.validateTitle(newTitle);
    this.data.title = newTitle;
  }

  changeDescription(newDescription: string) {
    this.data.description = newDescription;
  }

  private cleanData() {
    this.data.title = this.data.title.trim();
    this.data.description = this.data.description.trim();
  }

  private validateTitle(title: string) {
    if (title.trim().length === 0) throw new ValidationError("empty title");
  }
}
