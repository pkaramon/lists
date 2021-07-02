import DatabaseError from "../../dataAccess/DatabaseError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";
import buildDeleteListItem from "./DeleteListItem";

let listDb: ListDbMemory;
let DeleteListItem: ReturnType<typeof buildDeleteListItem>;
const listWithItemsId = new NumberId(1);
const emptyListId = new NumberId(2);
const authorId = new NumberId(1);
beforeEach(async () => {
  listDb = new ListDbMemory();
  DeleteListItem = buildDeleteListItem({ listDb });

  const listWithListItems = new List({
    id: listWithItemsId,
    authorId,
    title: "list with list items",
    description: "",
  });
  listWithListItems.addListItem(new TextListItem("first"));
  listWithListItems.addListItem(new DetailedListItem("second", "desc"));
  listWithListItems.addListItem(new TextListItem("third"));
  await listDb.save(listWithListItems);

  const emptyList = new List({
    id: emptyListId,
    authorId: new NumberId(1),
    title: "first list",
    description: "",
  });
  await listDb.save(emptyList);
});

test("user does not have access to the list", async () => {
  const fn = () =>
    new DeleteListItem({
      userId: new NumberId(123),
      listId: listWithItemsId,
      listItemIndex: 0,
    }).execute();
  await expect(fn).rejects.toThrowError(UserNoAccessError);
});

test("list does not exist", async () => {
  const fn = async () =>
    await new DeleteListItem({
      userId: authorId,
      listId: new NumberId(100),
      listItemIndex: 0,
    }).execute();
  await expect(fn).rejects.toThrow("list not found");
});

test("listItemIndex is invalid", async () => {
  const deleteAt = (listId: Id, index: number) =>
    new DeleteListItem({
      userId: authorId,
      listId,
      listItemIndex: index,
    }).execute();
  await expect(deleteAt(listWithItemsId, 3)).rejects.toThrow(
    "no list item at index: 3"
  );
  await expect(deleteAt(emptyListId, 0)).rejects.toThrow(
    "no list item at index: 0"
  );
  await expect(deleteAt(listWithItemsId, 3.14)).rejects.toThrow(
    "no list item at index: 3.14"
  );
});

test("deleting listItem", async () => {
  const saveSpy = jest.spyOn(listDb, "save");
  await new DeleteListItem({
    userId: authorId,
    listId: listWithItemsId,
    listItemIndex: 1,
  }).execute();

  const list = await listDb.getById(new NumberId(1));
  expect(list.length).toBe(2);
  expect((list.getListItemAt(0) as TextListItem).title).toBe("first");
  expect((list.getListItemAt(1) as TextListItem).title).toBe("third");
  expect(saveSpy).toHaveBeenCalledWith(list);
});

describe("ListDb errors", () => {
  const errorFn = () => {
    throw new DatabaseError();
  };
  const fn = async () =>
    await new DeleteListItem({
      userId: authorId,
      listId: listWithItemsId,
      listItemIndex: 1,
    }).execute();

  test("save error", async () => {
    listDb.save = errorFn;
    await expect(fn).rejects.toThrow(ServerError);
    await expect(fn).rejects.toThrow("could not save the changes");
  });

  test("getById error", async () => {
    listDb.getById = errorFn;
    await expect(fn).rejects.toThrow(ServerError);
    await expect(fn).rejects.toThrow("could not get the list");
  });
});
