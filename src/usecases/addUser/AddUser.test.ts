import Clock from "../../model/Clock";
import NumberId from "../../fakes/NumberId";
import ValidationError from "../../model/ValidationError";
import buildAddUser from "./AddUser";
import NumberIdCreator from "../../fakes/NumberIdCreator";
import UserDbMemory from "../../fakes/UserDbMemory";
import FakeHasher from "../../fakes/FakeHasher";

const hasher = new FakeHasher();
Clock.inst = {
  now: () => new Date("2020-01-01"),
};
let userDb: UserDbMemory;
let AddUser: ReturnType<typeof buildAddUser>;

beforeEach(() => {
  userDb = new UserDbMemory();
  AddUser = buildAddUser({ idCreator: new NumberIdCreator(), userDb, hasher });
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

test("unexpected database error", () => {});
