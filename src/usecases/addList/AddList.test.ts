import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import {
  UserDbMemory,
  ListDbMemory,
  NumberIdCreator,
  NumberId,
  FakeHasher,
} from "../../fakes";
import ServerError from "../ServerError";
import buildAddList from ".";
import InvalidListDataError from "./InvalidListDataError";
import User from "../../domain/User";

let userDb: UserDbMemory;
let listDb: ListDb;
let userId: Id = new NumberId(1);
let AddList: ReturnType<typeof buildAddList>;

beforeEach(async () => {
  userDb = new UserDbMemory();
  listDb = new ListDbMemory();
  await userDb.save(
    new User({
      id: userId,
      name: "bob",
      email: "bob@mail.com",
      password: await new FakeHasher().hash("bobpass123"),
      birthDate: new Date("2000-03-12"),
    })
  );
  AddList = buildAddList({ userDb, listDb, idCreator: new NumberIdCreator() });
});

const listData = {
  list: { title: "first list", description: "some description" },
};

test("list has empty title", () => {
  return expect(async () => {
    await new AddList({
      userId,
      list: { title: "  ", description: "abc" },
    }).execute();
  }).rejects.toThrow(InvalidListDataError);
});

test("adding list to db", async () => {
  const { listId } = await new AddList({ userId, ...listData }).execute();
  const list = await listDb.getById(listId);
  expect(list.title).toBe(listData.list.title);
  expect(list.description).toBe(listData.list.description);
  expect(list.authorId.equals(userId)).toBe(true);
  expect(list.id.equals(new NumberId(1))).toBe(true);
});

test("listDb.save DatabaseError", async () => {
  listDb.save = async () => {
    throw new DatabaseError();
  };

  await expect(() =>
    new AddList({ userId, ...listData }).execute()
  ).rejects.toThrowError(ServerError);
});
