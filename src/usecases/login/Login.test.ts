import DatabaseError from "../../dataAccess/DatabaseError";
import UserDb from "../../dataAccess/UserDb";
import Clock from "../../domain/Clock";
import User from "../../domain/User";
import FakeClock from "../../fakes/FakeClock";
import FakeHasher from "../../fakes/FakeHasher";
import FakeTokenCreator from "../../fakes/FakeTokenCreator";
import NumberId from "../../fakes/NumberId";
import UserDbMemory from "../../fakes/UserDbMemory";
import ServerError from "../ServerError";
import InvalidLoginDataError from "./InvalidLoginDataError";
import buildLogin from "./Login";

const hasher = new FakeHasher();
Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
let userDb: UserDb;
let Login: ReturnType<typeof buildLogin>;

beforeEach(async () => {
  userDb = new UserDbMemory();
  Login = buildLogin({ userDb, hasher, tokenCreator: new FakeTokenCreator() });
  await userDb.save(
    new User({
      id: new NumberId(1),
      email: "bob@mail.com",
      name: "Bob",
      password: await hasher.hash("bobpass123"),
      birthDate: new Date("2000-03-12"),
    })
  );
});

test("user with email does not exist", async () => {
  await expect(
    async () =>
      await new Login({
        email: "doesnotexist@mail.com",
        password: "password123",
      }).execute()
  ).rejects.toThrow(InvalidLoginDataError);
});

test("user with email exist but password does not match", async () => {
  await expect(
    async () =>
      await new Login({
        email: "bob@mail.com",
        password: "wrongpassword",
      }).execute()
  ).rejects.toThrow(InvalidLoginDataError);
});

test("user with email exist and password is correct", async () => {
  const { userToken } = await new Login({
    email: "bob@mail.com",
    password: "bobpass123",
  }).execute();
  expect(userToken).toBe("###1###");
});

test("unexpected database error", async () => {
  userDb.getByEmail = () => {
    throw new DatabaseError("database error");
  };

  const fn = () =>
    new Login({
      email: "bob@mail.com",
      password: "bobpass123",
    }).execute();

  await expect(fn).rejects.toThrowError(ServerError);
});
