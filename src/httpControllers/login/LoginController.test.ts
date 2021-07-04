import UserDb from "../../dataAccess/UserDb";
import Clock from "../../domain/Clock";
import User from "../../domain/User";
import FakeClock from "../../fakes/FakeClock";
import FakeHasher from "../../fakes/FakeHasher";
import FakeTokenCreator from "../../fakes/FakeTokenCreator";
import NumberId from "../../fakes/NumberId";
import UserDbMemory from "../../fakes/UserDbMemory";
import buildLogin from "../../usecases/login/Login";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
} from "../__test__/fixtures";
import LoginController from ".";

let userDb: UserDb;
let loginController: LoginController;
beforeEach(async () => {
  userDb = new UserDbMemory();
  Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
  const hasher = new FakeHasher();
  userDb.save(
    new User({
      id: new NumberId(1),
      email: "bob@mail.com",
      password: await hasher.hash("password123"),
      name: "bob",
      birthDate: new Date("2003-03-12"),
    })
  );
  loginController = new LoginController(
    buildLogin({ userDb, hasher, tokenCreator: new FakeTokenCreator() })
  );
});

test("invalid email or password", async () => {
  for (const body of [
    { email: "unknown@mail.com", password: "wrong" },
    { email: "unknown@mail.com", password: "password123" },
    { email: "bob@mail.com", password: "wrong" },
  ]) {
    const response = await loginController.handle({ body });
    expectStatusCodeToBe(response, StatusCode.BadRequest);
    expectErrorMessageToBe(response, "email or password is invalid");
  }
});

test("valid email and password", async () => {
  const response = await loginController.handle({
    body: { email: "bob@mail.com", password: "password123" },
  });
  expectStatusCodeToBe(response, StatusCode.Ok);
  expectDataToMatch(response, { token: "###1###" });
});
