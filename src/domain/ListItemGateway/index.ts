import ListItem from "../../domain/ListItem";

export type ListData = Record<string, any>;

export default interface ListItemGateway {
  fromDataToObject(data: ListData): ListItem;
  fromObjectToData(listItem: ListItem): ListData;
}

export class UnknownListItemTypeError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = UnknownListItemTypeError.name;
  }
}
