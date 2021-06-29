import ListItem from ".";

export default class DetailedListItem extends ListItem {
  constructor(_title: string, private _description: string) {
    super(_title);
  }

  get description() {
    return this._description;
  }

  toDataObject() {
    return {
      title: this.title,
      description: this._description,
    };
  }
}
