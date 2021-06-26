import Clock from "../model/Clock";
import NumberId from "../fakes/NumberId";
import ValidationError from "../model/ValidationError";
import buildAddUser from "./AddUser";
import NumberIdCreator from "../fakes/NumberIdCreator";
import UserDbMemory from "../fakes/UserDbMemory";
import FakeHasher from "../fakes/FakeHasher";

const userDb = new UserDbMemory();
const hasher = new FakeHasher();
let AddUser: ReturnType<typeof buildAddUser>;

beforeEach(() => {
  userDb.clear();
  AddUser = buildAddUser({ idCreator: new NumberIdCreator(), userDb, hasher });
});
beforeAll(() => {
  Clock.inst = {
    now: () => new Date("2020-01-01"),
  };
});

const validUserData = {
  name: "Bob",
  email: "bob@mail.com",
  birthDate: new Date("2000-01-01"),
  password: "STRONG_PASSWORD",
};

it("when validation fails it rethrows the error", async () => {
  const addUser = new AddUser({ ...validUserData, email: "NOT AN EMAIL" });
  try {
    await addUser.execute();
    fail("should have thrown");
  } catch (e) {
    expect(e instanceof ValidationError).toBe(true);
    expect(e.message).toBe("email must be a valid email");
  }
});

it("throws an error if the email is not unique", async () => {
  await new AddUser(validUserData).execute();
  try {
    await new AddUser({
      name: "Tom",
      email: validUserData.email,
      birthDate: new Date("2001-02-02"),
      password: "PASSWORD123321",
    }).execute();
    throw new Error("it should have thrown");
  } catch (e) {
    expect(e.message).toBe("email is already taken");
  }
});

it("should save created user to the database", async () => {
  await new AddUser(validUserData).execute();
  const user = await userDb.getById(new NumberId(1));
  expect(user.email).toBe(validUserData.email);
  expect(user.name).toBe(validUserData.name);
  expect(user.birthDate).toStrictEqual(validUserData.birthDate);
  expect(user.password).toBe(await hasher.hash(validUserData.password));
  expect(user.id).toEqual(new NumberId(1));
});

it("returns id of newly created user", async () => {
  let res = await new AddUser(validUserData).execute();
  expect(res.userId).toEqual(new NumberId(1));
  res = await new AddUser({ ...validUserData, email: "t@mail.com" }).execute();
  expect(res.userId).toEqual(new NumberId(2));
});
