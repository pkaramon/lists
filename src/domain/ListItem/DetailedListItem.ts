import ListItem from ".";

export default class DetailedListItem extends ListItem {
  constructor(private _title: string, private _description: string) {
    super();
  }

  get title() {
    return this._title;
  }
  get description() {
    return this._description;
  }
}
