import UserDb from "../../dataAccess/UserDb";
import Clock from "../../domain/Clock";
import User from "../../domain/User";
import FakeClock from "../../fakes/FakeClock";
import FakeHasher from "../../fakes/FakeHasher";
import NumberId from "../../fakes/NumberId";
import UserDbMemory from "../../fakes/UserDbMemory";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
  MockUseCase,
} from "../__test__/fixtures";
import LoginController from ".";
import InvalidLoginDataError from "../../usecases/login/InvalidLoginDataError";

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
  loginController = new LoginController(MockUseCase);
});

test("invalid email or password", async () => {
  MockUseCase.mockError(new InvalidLoginDataError());
  const response = await loginController.handle({
    body: { email: "bob@mail.com", password: "pass123" },
  });
  expectStatusCodeToBe(response, StatusCode.BadRequest);
  expectErrorMessageToBe(response, "email or password is invalid");
});

test("valid email and password", async () => {
  MockUseCase.mockResult({ token: "###1###" });

  const body = { email: "bob@mail.com", password: "password123" };
  const response = await loginController.handle({ body });

  MockUseCase.expectPassedDataToMatch(body);

  expectStatusCodeToBe(response, StatusCode.Ok);
  expectDataToMatch(response, { token: "###1###" });
});
