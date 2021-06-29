import ListItem from ".";

export default class TextListItem extends ListItem {
  constructor(_title: string) {
    super(_title);
  }

  toDataObject() {
    return {
      title: this.title,
    };
  }
}
