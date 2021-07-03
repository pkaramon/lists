import ListItem from "../../domain/ListItem";
import CheckBoxListItem from "../../domain/ListItem/CheckboxListItem";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListItemFactory, {UnknownListItemTypeError} from "./ListItemFactory";

export default class ListItemFactoryImp implements ListItemFactory {
  createListItem(
    data:
      | { type: "text"; title: string }
      | { type: "checkbox"; title: string; checked: boolean }
      | { type: "detailed"; title: string; description: string }
  ): ListItem {
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
}
