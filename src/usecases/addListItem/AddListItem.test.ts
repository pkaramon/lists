import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import List from "../../domain/List";
import ListItem from "../../domain/ListItem";
import CheckBoxListItem from "../../domain/ListItem/CheckboxListItem";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import ServerError from "../ServerError";
import buildAddListItem from "./AddListItem";
import ListItemFactoryImp from "./ListItemFactoryImp";
import UserNoAccessError from "../UserNoAccessError";

let listDb: ListDb;
let AddListItem: ReturnType<typeof buildAddListItem>;
const authorId = new NumberId(7);
beforeEach(async () => {
  listDb = new ListDbMemory();
  AddListItem = buildAddListItem({
    listDb,
    listItemFactory: new ListItemFactoryImp(),
  });
  await listDb.save(
    new List({
      id: new NumberId(1),
      title: "list title",
      authorId,
      description: "list description",
    })
  );
});

test("user is not the author of the list", async () => {
  const fn = async () =>
    await new AddListItem({
      userId: new NumberId(123),
      listId: new NumberId(1),
      listItem: { type: "text", title: "list item 1" },
    }).execute();
  await expect(fn).rejects.toThrow(UserNoAccessError);
});

test("list not in the db", async () => {
  const fn = async () =>
    await new AddListItem({
      userId: authorId,
      listId: new NumberId(2),
      listItem: { type: "text", title: "list item 1" },
    }).execute();
  await expect(fn).rejects.toThrow("list not found");
});

describe("adding different types of listItems", () => {
  async function testAddingListItem(
    addListItemData: ConstructorParameters<typeof AddListItem>[0],
    additionalExpectations: (li: ListItem) => void
  ) {
    const saveSpy = jest.spyOn(listDb, "save");
    await new AddListItem(addListItemData).execute();
    const list = await listDb.getById(new NumberId(1));
    const listItem = list.getListItemAt(0);

    additionalExpectations(listItem);
    expect(saveSpy).toHaveBeenCalledWith(list);
  }

  test("adding text list item", async () => {
    await testAddingListItem(
      {
        userId: authorId,
        listId: new NumberId(1),
        listItem: { type: "text", title: "abc" },
      },
      (li) => {
        const listItem = li as TextListItem;
        expect(listItem.title).toBe("abc");
      }
    );
  });

  test("adding checkbox list item", async () => {
    await testAddingListItem(
      {
        userId: authorId,
        listId: new NumberId(1),
        listItem: { type: "checkbox", title: "abc", checked: true },
      },
      (li) => {
        const listItem = li as CheckBoxListItem;
        expect(listItem.title).toBe("abc");
        expect(listItem.checked).toBe(true);
      }
    );
  });

  test("adding detailed list item", async () => {
    await testAddingListItem(
      {
        userId: authorId,
        listId: new NumberId(1),
        listItem: { type: "detailed", title: "abc", description: "def" },
      },
      (li) => {
        const listItem = li as DetailedListItem;
        expect(listItem.title).toBe("abc");
        expect(listItem.description).toBe("def");
      }
    );
  });
});

describe("database failures", () => {
  const fn = async () =>
    await new AddListItem({
      userId: authorId,
      listId: new NumberId(1),
      listItem: { type: "detailed", title: "abc", description: "def" },
    }).execute();

  test("unexpected listDb.getById failure", async () => {
    listDb.getById = () => {
      throw new DatabaseError();
    };
    await expect(fn).rejects.toThrow(ServerError);
    await expect(fn).rejects.toThrow("could not get list");
  });

  test("unexpected listDb.save failure", async () => {
    listDb.save = () => {
      throw new DatabaseError();
    };
    await expect(fn).rejects.toThrow(ServerError);
    await expect(fn).rejects.toThrow("could not save");
  });
});

test("adding multiple list items", async () => {
  await new AddListItem({
    userId: authorId,
    listId: new NumberId(1),
    listItem: { type: "detailed", title: "abc", description: "def" },
  }).execute();

  await new AddListItem({
    userId: authorId,
    listId: new NumberId(1),
    listItem: { type: "text", title: "hello" },
  }).execute();

  const list = await listDb.getById(new NumberId(1));
  const first = list.getListItemAt(0) as DetailedListItem;
  const second = list.getListItemAt(1) as TextListItem;

  expect(first.title).toBe("abc");
  expect(first.description).toBe("def");
  expect(second.title).toBe("hello");
});
