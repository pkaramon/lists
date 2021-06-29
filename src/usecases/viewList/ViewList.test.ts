import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import List from "../../domain/List";
import CheckBoxListItem from "../../domain/ListItem/CheckboxListItem";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import buildViewList from "./ViewList";

let listDb: ListDb;
let ViewList: ReturnType<typeof buildViewList>;
beforeEach(async () => {
  listDb = new ListDbMemory();
  ViewList = buildViewList({ listDb });

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

test("list not in db", async () => {
  const fn = () => new ViewList({ listId: new NumberId(100) }).execute();
  await expect(fn).rejects.toThrowError("list not found");
});

test("view list", async () => {
  const res = await new ViewList({ listId: new NumberId(1) }).execute();
  expect(res).toEqual({
    title: "list title",
    description: "list desc",
    length: 3,
    listItems: [
      { title: "first" },
      { title: "second", description: "desc" },
      { title: "third", checked: false },
    ],
  });
});

test("listDb getById error", async () => {
  listDb.getById = () => {
    throw new DatabaseError();
  };
  const fn = () => new ViewList({ listId: new NumberId(1) }).execute();
  await expect(fn).rejects.toThrowError("could not view the list");
});
