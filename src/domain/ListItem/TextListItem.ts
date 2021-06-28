import ListItem from ".";

export default class TextListItem extends ListItem {
  constructor(private _title: string) {
    super();
  }
  get title() {
    return this._title;
  }
}
