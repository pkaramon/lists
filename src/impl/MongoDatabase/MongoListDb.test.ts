import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import List from "../../domain/List";
import CheckBoxListItem from "../../domain/ListItem/CheckboxListItem";
import DetailedListItem from "../../domain/ListItem/DetailedListItem";
import TextListItem from "../../domain/ListItem/TextListItem";
import ListItemGatewayImp from "../../domain/ListItemGateway/ListItemGatewayImp";
import UUID from "../UUID/UUID";
import UUIDConverter from "../UUID/UUIDConverter";
import MongoListDb from "./MongoListDb";

const dbData = {
  uri: "mongodb://localhost:27017",
  databaseName: "TEST_DB",
  collectionName: "LISTS",
};
const utils = {
  listIdConverter: new UUIDConverter(),
  userIdConverter: new UUIDConverter(),
  listItemGateway: new ListItemGatewayImp(),
};
const db = new MongoListDb(dbData, utils);

const listData = {
  id: new UUID("56c42140-76dc-452d-86f3-b7d582b41068"),
  title: "first title",
  description: "description",
  authorId: new UUID("aae1df80-e3be-4f8f-afc9-ede35ff817db"),
};

beforeEach(async () => await db.TESTS_ONLY_clear());
afterAll(async () => await db.TESTS_ONLY_clear());

test("saving and retriving empty list", async () => {
  await db.save(new List(listData));
  const list = await db.getById(listData.id);
  expect(list.id.equals(listData.id)).toBe(true);
  expect(list.title).toBe(listData.title);
  expect(list.description).toBe(listData.description);
  expect(list.authorId.equals(listData.authorId)).toBe(true);
});

test("saving and retriving list with items", async () => {
  let list = new List(listData);
  list.addListItem(new TextListItem("first"));
  list.addListItem(new CheckBoxListItem("second", true));
  list.addListItem(new DetailedListItem("third", "desc"));
  await db.save(list);

  list = await db.getById(listData.id);
  expect(list.length).toBe(3);
  const first = list.getListItemAt(0);
  expect(first.title).toBe("first");

  const second = list.getListItemAt(1) as CheckBoxListItem;
  expect(second.title).toBe("second");
  expect(second.checked).toBe(true);

  const third = list.getListItemAt(2) as DetailedListItem;
  expect(third.title).toBe("third");
  expect(third.description).toBe("desc");
});

test("saving, making changes and saving again", async () => {
  await db.save(new List(listData));
  let list = await db.getById(listData.id);
  expect(list.length).toBe(0);
  list.addListItem(new TextListItem("title"));
  await db.save(list);
  list = await db.getById(listData.id);
  expect(list.length).toBe(1);
});

test("getById - list does not exist", () => {
  expect(() => db.getById(listData.id)).rejects.toThrowError(NotFoundError);
});

test("in case of mongo errors it should throw DatabaseError", async () => {
  const db = new MongoListDb({ ...dbData, uri: "INVALID" }, utils);
  await expect(() => db.save(new List(listData))).rejects.toThrowError(
    DatabaseError
  );
});

test("deleteById - list does not exist", async () => {
  await expect(() => db.deleteById(listData.id)).rejects.toThrowError(
    NotFoundError
  );
});

test("deleteById - list exists", async () => {
  await db.save(new List(listData));
  await db.deleteById(listData.id);
  await expect(() => db.getById(listData.id)).rejects.toThrowError(
    NotFoundError
  );
});
