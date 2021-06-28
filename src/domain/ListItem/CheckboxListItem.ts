import ListItem from ".";

export default class CheckBoxListItem extends ListItem {
  constructor(private _title: string, private _checked: boolean) {
    super();
  }

  get title() {
    return this._title;
  }

  get checked() {
    return this._checked;
  }
}
