import DatabaseError from "../../dataAccess/DatabaseError";
import List from "../../domain/List";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import ServerError from "../ServerError";
import buildDeleteListItem from "./DeleteListItem";

let listDb: ListDbMemory;
let DeleteListItem: ReturnType<typeof buildDeleteListItem>;

beforeEach(async () => {
  listDb = new ListDbMemory();
  DeleteListItem = buildDeleteListItem({ listDb });

  const listWithListItems = new List({
    id: new NumberId(1),
    authorId: new NumberId(1),
    title: "list with list items",
    description: "",
  });
  listWithListItems.addListItem(new TextListItem("first"));
  listWithListItems.addListItem(new DetailedListItem("second", "desc"));
  listWithListItems.addListItem(new TextListItem("third"));
  await listDb.save(listWithListItems);

  const emptyList = new List({
    id: new NumberId(2),
    authorId: new NumberId(1),
    title: "first list",
    description: "",
  });
  await listDb.save(emptyList);
});

test("list does not exist", async () => {
  const DeleteListItem = buildDeleteListItem({ listDb });
  const fn = async () =>
    await new DeleteListItem({
      listId: new NumberId(100),
      listItemIndex: 0,
    }).execute();

  await expect(fn).rejects.toThrow("list not found");
});

test("listItemIndex is invalid", async () => {
  await expect(
    async () =>
      await new DeleteListItem({
        listId: new NumberId(1),
        listItemIndex: 3,
      }).execute()
  ).rejects.toThrow("no list item at index: 3");

  await expect(
    async () =>
      await new DeleteListItem({
        listId: new NumberId(2),
        listItemIndex: 0,
      }).execute()
  ).rejects.toThrow("no list item at index: 0");

  await expect(
    async () =>
      await new DeleteListItem({
        listId: new NumberId(2),
        listItemIndex: 3.14,
      }).execute()
  ).rejects.toThrow("no list item at index: 3.14");
});

test("deleting listitem", async () => {
  const saveSpy = jest.spyOn(listDb, "save");
  await new DeleteListItem({
    listId: new NumberId(1),
    listItemIndex: 1,
  }).execute();

  const list = await listDb.getById(new NumberId(1));
  expect(list.length).toBe(2);
  expect((list.listItems[0] as TextListItem).title).toBe("first");
  expect((list.listItems[1] as TextListItem).title).toBe("third");
  expect(saveSpy).toHaveBeenCalledWith(list);
});

test("listDb save error", async () => {
  listDb.save = () => {
    throw new DatabaseError();
  };

  const fn = async () =>
    await new DeleteListItem({
      listId: new NumberId(1),
      listItemIndex: 1,
    }).execute();

  await expect(fn).rejects.toThrow(ServerError);
  await expect(fn).rejects.toThrow("could not save the changes");
});

test("listDb retrival error", async () => {
  listDb.getById = () => {
    throw new DatabaseError();
  };

  const fn = async () =>
    await new DeleteListItem({
      listId: new NumberId(1),
      listItemIndex: 1,
    }).execute();

  await expect(fn).rejects.toThrow(ServerError);
  await expect(fn).rejects.toThrow("could not get the list");
});
