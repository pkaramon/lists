import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import UserDb from "../../dataAccess/UserDb";
import Clock from "../../domain/Clock";
import User from "../../domain/User";
import FakeClock from "../../fakes/FakeClock";
import NumberId from "../../fakes/NumberId";
import UserDbMemory from "../../fakes/UserDbMemory";
import buildDeleteUser from ".";
import UserNotFoundError from "../addList/UserNotFoundError";

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
let userDb: UserDb;
let DeleteUser: ReturnType<typeof buildDeleteUser>;
beforeEach(async () => {
  userDb = new UserDbMemory();
  DeleteUser = buildDeleteUser({ userDb });
  await userDb.save(
    new User({
      id: new NumberId(1),
      name: "bob",
      email: "bob@mail.com",
      password: "1234567",
      birthDate: new Date("2000-01-01"),
    })
  );
});

test("user not in the database", async () => {
  const fn = () => new DeleteUser({ userId: new NumberId(100) }).execute();
  await expect(fn).rejects.toThrow(UserNotFoundError);
});

test("delete user from db", async () => {
  await new DeleteUser({ userId: new NumberId(1) }).execute();
  const fn = () => userDb.getById(new NumberId(1));
  await expect(fn).rejects.toThrowError(NotFoundError);
});

test("userDb deleteById error", async () => {
  userDb.deleteById = () => {
    throw new DatabaseError();
  };
  const fn = () => new DeleteUser({ userId: new NumberId(1) }).execute();
  await expect(fn).rejects.toThrowError("could not delete the user");
});
