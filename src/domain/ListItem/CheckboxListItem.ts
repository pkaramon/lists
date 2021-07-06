import ListItem from ".";

export default class CheckBoxListItem extends ListItem {
  constructor(_title: string, private _checked: boolean) {
    super(_title);
  }

  get checked() {
    return this._checked;
  }

  toDataObject() {
    return {
      type: "checkbox",
      title: this.title,
      checked: this._checked,
    };
  }
}
