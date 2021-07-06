import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import Clock from "../../domain/Clock";
import User from "../../domain/User";
import { FakeClock } from "../../fakes";
import UUID from "../UUID/UUID";
import UUIDConverter from "../UUID/UUIDConverter";
import UUIDCreator from "../UUID/UUIDCreator";
import MongoUserDb from "./MongoUserDb";

const db = new MongoUserDb(
  {
    uri: "mongodb://localhost:27017",
    databaseName: "TEST_DB",
    collectionName: "USERS_TEST",
  },
  { idConverter: new UUIDConverter() }
);

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
const idCreator = new UUIDCreator();
afterEach(async () => {
  await db.TESTS_ONLY_clear();
});

const userData = {
  id: new UUID("9a60c379-f846-43b1-b59d-611298cb49d7"),
  name: "bob",
  email: "bob@mail.com",
  password: "password123",
  birthDate: new Date("2000-01-01"),
};

function checkUser(user: User) {
  expect(user.id.equals(userData.id)).toBe(true);
  expect(user.birthDate).toEqual(userData.birthDate);
  expect(user.name).toEqual(userData.name);
  expect(user.email).toEqual(userData.email);
  expect(user.password).toEqual(userData.password);
}

test("saving and retrieving", async () => {
  await db.save(new User(userData));
  const user = await db.getById(userData.id);
  checkUser(user);
});

test("getById - user does not exist", async () => {
  await expect(() => db.getById(idCreator.create())).rejects.toThrow(
    NotFoundError
  );
});

test("retrieving by email", async () => {
  await db.save(new User(userData));
  const user = await db.getByEmail(userData.email);
  checkUser(user);
});

test("retrieving by email - user with email does not exist", async () => {
  await expect(() => db.getByEmail("tom@mail.com")).rejects.toThrow(
    NotFoundError
  );
});

test("deleteById", async () => {
  await db.save(new User(userData));
  await db.getById(userData.id);
  await db.deleteById(userData.id);
  await expect(() => db.getById(userData.id)).rejects.toThrow(NotFoundError);
});

test("deleteById - user with id does not exist", async () => {
  await expect(() => db.deleteById(userData.id)).rejects.toThrowError(
    NotFoundError
  );
});

test("it should throw DatabaseError in an unexpected failure", async () => {
  const db = new MongoUserDb(
    { uri: "INVALID URI", collectionName: "", databaseName: "" },
    { idConverter: new UUIDConverter() }
  );
  await expect(() => db.save(new User(userData))).rejects.toThrowError(
    DatabaseError
  );
});
