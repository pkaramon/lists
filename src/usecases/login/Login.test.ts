import FakeClock from "../../fakes/FakeClock";
import FakeHasher from "../../fakes/FakeHasher";
import FakeTokenCreator from "../../fakes/FakeTokenCreator";
import NumberId from "../../fakes/NumberId";
import NumberIdCreator from "../../fakes/NumberIdCreator";
import UserDbMemory from "../../fakes/UserDbMemory";
import Clock from "../../domain/Clock";
import buildAddUser, { IdCreator } from "../addUser/AddUser";
import ServerError from "../ServerError";
import buildLogin from "./Login";
import DatabaseError from "../../dataAccess/DatabaseError";
import UserDb from "../../dataAccess/UserDb";

const hasher = new FakeHasher();
Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
const tokenCreator = new FakeTokenCreator();
let userDb: UserDb;
let idCreator: IdCreator;
let Login: ReturnType<typeof buildLogin>;
let AddUser: ReturnType<typeof buildAddUser>;

beforeEach(async () => {
  userDb = new UserDbMemory();
  idCreator = new NumberIdCreator();
  Login = buildLogin({ userDb, hasher, tokenCreator });
  AddUser = buildAddUser({ userDb, hasher, idCreator });
  await new AddUser({
    email: "bob@mail.com",
    name: "Bob",
    password: "bobpass123",
    birthDate: new Date("2000-03-12"),
  }).execute();
});

test("user with email does not exist", async () => {
  return expect(
    async () =>
      await new Login({
        email: "doesnotexist@mail.com",
        password: "password123",
      }).execute()
  ).rejects.toThrow("email or password is invalid");
});

test("user with email exist but password does not match", () => {
  return expect(
    async () =>
      await new Login({
        email: "bob@mail.com",
        password: "wrongpassword",
      }).execute()
  ).rejects.toThrow("email or password is invalid");
});

test("user with email exist and password is correct", async () => {
  const { userToken } = await new Login({
    email: "bob@mail.com",
    password: "bobpass123",
  }).execute();
  expect(userToken).toBe(await tokenCreator.create(new NumberId(1)));
});

test("unexpected database error", async () => {
  userDb.getByEmail = () => {
    throw new DatabaseError("database error");
  };

  try {
    await new Login({
      email: "bob@mail.com",
      password: "bobpass123",
    }).execute();
    fail("should have thrown");
  } catch (e) {
    expect(e instanceof ServerError).toBe(true);
    expect(e.message).toBe("server error");
  }
});
