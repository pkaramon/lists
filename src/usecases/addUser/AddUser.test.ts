import DatabaseError from "../../dataAccess/DatabaseError";
import Clock from "../../domain/Clock";
import ValidationError from "../../domain/ValidationError";
import FakeClock from "../../fakes/FakeClock";
import FakeHasher from "../../fakes/FakeHasher";
import NumberId from "../../fakes/NumberId";
import NumberIdCreator from "../../fakes/NumberIdCreator";
import UserDbMemory from "../../fakes/UserDbMemory";
import ServerError from "../ServerError";
import buildAddUser from "./AddUser";

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
const hasher = new FakeHasher();
let userDb: UserDbMemory;
let AddUser: ReturnType<typeof buildAddUser>;

beforeEach(() => {
  userDb = new UserDbMemory();
  AddUser = buildAddUser({
    idCreator: new NumberIdCreator(),
    userDb,
    hasher,
  });
});

const userData = {
  name: "Bob",
  email: "bob@mail.com",
  birthDate: new Date("2000-01-01"),
  password: "STRONG_PASSWORD",
};

test("invalid data", async () => {
  const addUser = new AddUser({ ...userData, email: "NOT AN EMAIL" });
  try {
    await addUser.execute();
    fail("should have thrown");
  } catch (e) {
    expect(e instanceof ValidationError).toBe(true);
    expect(e.message).toBe("email must be a valid email");
  }
});

test("email is not unique", async () => {
  await new AddUser(userData).execute();
  try {
    await new AddUser({
      name: "Tom",
      email: userData.email,
      birthDate: new Date("2001-02-02"),
      password: "PASSWORD123321",
    }).execute();
    throw new Error("it should have thrown");
  } catch (e) {
    expect(e.message).toBe("email is already taken");
  }
});

test("data is correct", async () => {
  await new AddUser(userData).execute();
  const user = await userDb.getById(new NumberId(1));
  expect(user.email).toBe(userData.email);
  expect(user.name).toBe(userData.name);
  expect(user.birthDate).toStrictEqual(userData.birthDate);
  expect(user.password).toBe(await hasher.hash(userData.password));
  expect(user.id).toEqual(new NumberId(1));
});

test("return value", async () => {
  let res = await new AddUser(userData).execute();
  expect(res.userId).toEqual(new NumberId(1));
  res = await new AddUser({ ...userData, email: "t@mail.com" }).execute();
  expect(res.userId).toEqual(new NumberId(2));
});

test("unexpected database error", async () => {
  const throwDbError = () => {
    throw new DatabaseError("db error");
  };
  userDb.save = userDb.getById = userDb.getByEmail = throwDbError;
  try {
    await new AddUser(userData).execute();
    fail("should have failed");
  } catch (e) {
    expect(e instanceof ServerError).toBe(true);
    expect(e.message).toBe("server error");
  }
});
