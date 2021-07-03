import ListItem from "../../domain/ListItem";

export default interface ListItemFactory {
  createListItem(data: any): ListItem;
}

export class UnknownListItemTypeError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = UnknownListItemTypeError.name;
  }
}

