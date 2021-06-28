import Id from "../Id";
import ListItem from "../ListItem";
import ValidationError from "../ValidationError";

export default class List {
  private _listItems: ListItem[] = [];
  constructor(
    private data: { id: Id; authorId: Id; title: string; description: string }
  ) {
    this.cleanData();
    this.validateTitle();
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

  get listItems() {
    return this._listItems;
  }

  get length() {
    return this._listItems.length;
  }

  addListItem(listItem: ListItem) {
    this._listItems.push(listItem);
  }

  removeListItemAt(index: number) {
    this._listItems.splice(index, 1)
  }

  private cleanData() {
    this.data.title = this.data.title.trim();
    this.data.description = this.data.description.trim();
  }

  private validateTitle() {
    if (this.data.title.length === 0) throw new ValidationError("empty title");
  }
}
