import ListItemGateway, { UnknownListItemTypeError } from ".";
import ListItem from "../ListItem";
import CheckBoxListItem from "../ListItem/CheckboxListItem";
import DetailedListItem from "../ListItem/DetailedListItem";
import TextListItem from "../ListItem/TextListItem";

interface TextListItemData {
  type: "text";
  title: string;
}

interface CheckBoxListItemData {
  type: "checkbox";
  title: string;
  checked: boolean;
}

interface DetailedListItemData {
  type: "detailed";
  title: string;
  description: string;
}

type ImpListData =
  | TextListItemData
  | CheckBoxListItemData
  | DetailedListItemData;

export default class ListItemGatewayImp implements ListItemGateway {
  fromDataToObject(data: ImpListData): ListItem {
    switch (data.type) {
      case "text":
        return new TextListItem(data.title);
      case "checkbox":
        return new CheckBoxListItem(data.title, data.checked);
      case "detailed":
        return new DetailedListItem(data.title, data.description);
      default:
        throw new UnknownListItemTypeError();
    }
  }

  fromObjectToData(listItem: ListItem): ImpListData {
    switch (listItem.constructor) {
      case TextListItem:
        return { type: "text", title: listItem.title };
      case CheckBoxListItem:
        return {
          type: "checkbox",
          title: listItem.title,
          checked: (listItem as CheckBoxListItem).checked,
        };
      case DetailedListItem:
        return {
          type: "detailed",
          title: listItem.title,
          description: (listItem as DetailedListItem).description,
        };
      default:
        throw new UnknownListItemTypeError();
    }
  }
}
