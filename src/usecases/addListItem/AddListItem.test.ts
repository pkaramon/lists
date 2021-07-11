import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import List from "../../domain/List";
import ListItem from "../../domain/ListItem";
import CheckBoxListItem from "../../domain/ListItem/CheckboxListItem";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import { NumberId, ListDbMemory } from "../../fakes";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";
import buildAddListItem from ".";
import ListNotFoundError from "../ListNotFoundError";
import ListItemGatewayImp from "../../domain/ListItemGateway/ListItemGatewayImp";
import { UnknownListItemTypeError } from "../../domain/ListItemGateway";

let listDb: ListDb;
let AddListItem: ReturnType<typeof buildAddListItem>;
const authorId = new NumberId(7);
const listId = new NumberId(1);
beforeEach(async () => {
  listDb = new ListDbMemory();
  AddListItem = buildAddListItem({
    listDb,
    listItemGateway: new ListItemGatewayImp(),
  });
  await listDb.save(
    new List({
      id: listId,
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
      listId,
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
  await expect(fn).rejects.toThrow(ListNotFoundError);
});

describe("adding different types of listItems", () => {
  async function testAddingListItem(
    addListItemData: ConstructorParameters<typeof AddListItem>[0],
    additionalExpectations: (li: ListItem) => void
  ) {
    const saveSpy = jest.spyOn(listDb, "save");
    await new AddListItem(addListItemData).execute();
    const list = await listDb.getById(listId);
    const listItem = list.getListItemAt(0);

    additionalExpectations(listItem);
    expect(saveSpy).toHaveBeenCalledWith(list);
  }

  test("adding text list item", async () => {
    await testAddingListItem(
      {
        userId: authorId,
        listId,
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
        listId,
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
        listId,
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

test("adding listItem with unknown type", async () => {
  const fn = async () =>
    await new AddListItem({
      userId: authorId,
      listId,
      listItem: { type: "xxxxx", title: "abc", description: "def" },
    }).execute();
  await expect(fn).rejects.toThrowError(UnknownListItemTypeError);
});

describe("database failures", () => {
  const fn = async () =>
    await new AddListItem({
      userId: authorId,
      listId,
      listItem: { type: "detailed", title: "abc", description: "def" },
    }).execute();
  const errorFn = () => {
    throw new DatabaseError();
  };

  test("unexpected listDb.getById failure", async () => {
    listDb.getById = errorFn;
    await expect(fn).rejects.toThrow(ServerError);
    await expect(fn).rejects.toThrow("could not get the list");
  });

  test("unexpected listDb.save failure", async () => {
    listDb.save = errorFn;
    await expect(fn).rejects.toThrow(ServerError);
    await expect(fn).rejects.toThrow("could not save");
  });
});

test("adding multiple list items", async () => {
  const addListItem = (listItem: any) =>
    new AddListItem({ userId: authorId, listId, listItem }).execute();

  await addListItem({ type: "detailed", title: "abc", description: "def" });
  await addListItem({ type: "text", title: "hello" });

  const list = await listDb.getById(listId);
  const first = list.getListItemAt(0) as DetailedListItem;
  const second = list.getListItemAt(1) as TextListItem;

  expect(first.title).toBe("abc");
  expect(first.description).toBe("def");
  expect(second.title).toBe("hello");
});
