import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import List from "../../domain/List";
import CheckBoxListItem from "../../domain/ListItem/CheckboxListItem";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListItemGatewayImp from "../../domain/ListItemGateway/ListItemGatewayImp";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import ListNotFoundError from "../ListNotFoundError";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";
import buildViewList from ".";

let listDb: ListDb;
let ViewList: ReturnType<typeof buildViewList>;
beforeEach(async () => {
  listDb = new ListDbMemory();
  ViewList = buildViewList({
    listDb,
    listItemGateway: new ListItemGatewayImp(),
  });

  const list = new List({
    id: new NumberId(1),
    title: "list title",
    description: "list desc",
    authorId: new NumberId(100),
  });
  list.addListItem(new TextListItem("first"));
  list.addListItem(new DetailedListItem("second", "desc"));
  list.addListItem(new CheckBoxListItem("third", false));

  await listDb.save(list);
});

test("user has no access to the list", async () => {
  const fn = () =>
    new ViewList({
      userId: new NumberId(123),
      listId: new NumberId(1),
    }).execute();
  await expect(fn).rejects.toThrowError(UserNoAccessError);
});

test("list not in db", async () => {
  const fn = () =>
    new ViewList({
      userId: new NumberId(100),
      listId: new NumberId(100),
    }).execute();
  await expect(fn).rejects.toThrowError(ListNotFoundError);
});

test("view list", async () => {
  const res = await new ViewList({
    userId: new NumberId(100),
    listId: new NumberId(1),
  }).execute();
  expect(res).toEqual({
    title: "list title",
    description: "list desc",
    length: 3,
    listItems: [
      { type: "text", title: "first" },
      { type: "detailed", title: "second", description: "desc" },
      { type: "checkbox", title: "third", checked: false },
    ],
  });
});

test("listDb getById error", async () => {
  listDb.getById = () => {
    throw new DatabaseError();
  };
  const fn = () =>
    new ViewList({
      userId: new NumberId(100),
      listId: new NumberId(1),
    }).execute();
  await expect(fn).rejects.toThrowError(ServerError);
});
