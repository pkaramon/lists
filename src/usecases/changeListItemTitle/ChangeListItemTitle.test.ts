import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import List from "../../domain/List";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import UserNoAccessError from "../UserNoAccessError";
import buildChangeListItemTitle from "./ChangeListItemTitle";

function getTestList() {
  const list = new List({
    id: new NumberId(1),
    authorId: new NumberId(101),
    title: "t",
    description: "d",
  });
  list.addListItem(new TextListItem("first"));
  list.addListItem(new DetailedListItem("second", "d"));
  return list;
}

let listDb: ListDb;
let ChangeListItemTitle: ReturnType<typeof buildChangeListItemTitle>;
beforeEach(async () => {
  listDb = new ListDbMemory();
  await listDb.save(getTestList());
  ChangeListItemTitle = buildChangeListItemTitle({ listDb });
});

test("user does not have acccess to the list(not an author)", async () => {
  const fn = () =>
    new ChangeListItemTitle({
      listId: new NumberId(1),
      userId: new NumberId(123),
      listItemIndex: 0,
      title: "new title",
    }).execute();

  await expect(fn).rejects.toThrow(UserNoAccessError);
});

test("list does not exist in db", async () => {
  const fn = () =>
    new ChangeListItemTitle({
      listId: new NumberId(123),
      userId: new NumberId(101),
      listItemIndex: 0,
      title: "new title",
    }).execute();

  await expect(fn).rejects.toThrow("list not found");
});

test("list exists but list item at specified index does not", async () => {
  const fn = () =>
    new ChangeListItemTitle({
      listId: new NumberId(1),
      userId: new NumberId(101),
      listItemIndex: 2,
      title: "new title",
    }).execute();
  await expect(fn).rejects.toThrow("no list item at index: 2");
});

test("changing title", async () => {
  const saveSpy = jest.spyOn(listDb, "save");
  await new ChangeListItemTitle({
    userId: new NumberId(101),
    listId: new NumberId(1),
    listItemIndex: 0,
    title: "new title",
  }).execute();

  expect(saveSpy).toHaveBeenCalled();

  const list = await listDb.getById(new NumberId(1));
  expect(list.getListItemAt(0).title).toBe("new title");
  expect(list.getListItemAt(1).title).toBe("second");
});

describe("listDb errors", () => {
  const errorFn = () => {
    throw new DatabaseError();
  };
  const tryToChangeListItemTitle = () =>
    new ChangeListItemTitle({
      userId: new NumberId(101),
      listId: new NumberId(1),
      listItemIndex: 0,
      title: "new title",
    }).execute();

  test("save error", async () => {
    listDb.save = errorFn;
    await expect(tryToChangeListItemTitle).rejects.toThrow(
      "could not save changes"
    );
  });

  test("getById error", async () => {
    listDb.getById = errorFn;
    await expect(tryToChangeListItemTitle).rejects.toThrow(
      "could not get the list"
    );
  });
});
