import Clock from "../../domain/Clock";
import FakeClock from "../../fakes/FakeClock";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
  MockUseCase,
} from "../__test__/fixtures";
import LoginController from ".";
import InvalidLoginDataError from "../../usecases/login/InvalidLoginDataError";

let loginController: LoginController;
beforeEach(async () => {
  Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
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
