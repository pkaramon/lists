export default abstract class ListItem {
  constructor(private _title: string) {}

  get title() {
    return this._title;
  }

  changeTitle(newTitle: string) {
    this._title = newTitle;
  }

  abstract toDataObject(): any;
}
