import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import Clock from "../../domain/Clock";
import Id from "../../domain/Id";
import {
  FakeClock,
  UserDbMemory,
  ListDbMemory,
  NumberIdCreator,
  FakeHasher,
  NumberId,
} from "../../fakes";
import buildAddUser from "../addUser/AddUser";
import ServerError from "../ServerError";
import buildAddList from "./AddList";
import InvalidListDataError from "./InvalidListDataError";
import UserNotFoundError from "./UserNotFoundError";

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
let userDb: UserDbMemory;
let listDb: ListDb;
let userId: Id;
let AddUser: ReturnType<typeof buildAddUser>;
let AddList: ReturnType<typeof buildAddList>;

beforeEach(async () => {
  userDb = new UserDbMemory();
  listDb = new ListDbMemory();
  AddUser = buildAddUser({
    idCreator: new NumberIdCreator(),
    userDb,
    hasher: new FakeHasher(),
  });
  userId = (
    await new AddUser({
      name: "bob",
      email: "bob@mail.com",
      password: "bobpass123",
      birthDate: new Date("2000-03-12"),
    }).execute()
  ).userId;

  AddList = buildAddList({ userDb, listDb, idCreator: new NumberIdCreator() });
});

const listData = {
  list: { title: "first list", description: "some description" },
};
describe("validation", () => {
  test("user not in db", async () => {
    return expect(async () => {
      await new AddList({ userId: new NumberId(2), ...listData }).execute();
    }).rejects.toThrow(UserNotFoundError);
  });

  test("empty title", () => {
    return expect(async () => {
      await new AddList({
        userId,
        list: { title: "  ", description: "abc" },
      }).execute();
    }).rejects.toThrow(InvalidListDataError);
  });
});

test("adding list to db", async () => {
  const { listId } = await new AddList({ userId, ...listData }).execute();
  const list = await listDb.getById(listId);
  expect(list.title).toBe(listData.list.title);
  expect(list.description).toBe(listData.list.description);
  expect(list.authorId.equals(userId)).toBe(true);
  expect(list.id.equals(new NumberId(1))).toBe(true);
});

test("unexpected userDb error", async () => {
  userDb.getById = () => {
    throw new DatabaseError("db err");
  };
  const fn = async () => await new AddList({ userId, ...listData }).execute();
  await expect(fn).rejects.toThrowError(ServerError);
});

test("unexpected listDb error", async () => {
  listDb.save = () => {
    throw new DatabaseError("db err");
  };
  const fn = async () => await new AddList({ userId, ...listData }).execute();
  await expect(fn).rejects.toThrowError(ServerError);
});
