import FakeUseCase from "../../fakes/FakeUseCase";
import NumberId from "../../fakes/NumberId";
import ServerError from "../../usecases/ServerError";
import {
  expectStatusCodeToBe,
  expectErrorMessageToBe,
  expectDataToMatch,
} from "../__test__/fixtures";
import buildAddUserController from "./addUser";

let addUserController: ReturnType<typeof buildAddUserController>;

beforeEach(() => {
  addUserController = buildAddUserController(FakeUseCase);
});

test("incomplete data", async () => {
  FakeUseCase.mockResult({ userId: new NumberId(1) });
  const response = await addUserController({
    body: { name: "bob", birthDate: new Date("2000-03-12").toJSON() },
  });

  expectStatusCodeToBe(response, 400);
  expectErrorMessageToBe(response, "2 attributes missing: email, password");
});

const requestBody = {
  name: "bob",
  email: "bob@mail.com",
  password: "password123",
  birthDate: new Date("2000-03-12").toJSON(),
};

test("addUser throws oridinary error", async () => {
  FakeUseCase.mockError(new Error("email is already taken"));
  const response = await addUserController({
    body: requestBody,
  });

  expectStatusCodeToBe(response, 400);
  expectErrorMessageToBe(response, "email is already taken");
});

test("addUser throws ServerError", async () => {
  FakeUseCase.mockError(new ServerError("CRITICAL FAILURE"));
  const response = await addUserController({
    body: requestBody,
  });

  expectStatusCodeToBe(response, 500);
  expectErrorMessageToBe(response, "CRITICAL FAILURE");
});

test("successfully creating a user", async () => {
  FakeUseCase.mockResult({ userId: new NumberId(123) });
  const response = await addUserController({
    body: requestBody,
  });
  expectStatusCodeToBe(response, 201);
  expectDataToMatch(response, { userId: 123 });
});
