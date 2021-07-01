import FakeUseCase from "../../fakes/FakeUseCase";
import NumberId from "../../fakes/NumberId";
import ServerError from "../../usecases/ServerError";
import {
  expectStatusCodeToBe,
  expectErrorMessageToBe,
  expectDataToMatch,
} from "../__test__/fixtures";
import buildAddUserController from "./AddUserController";

let addUserController: InstanceType<ReturnType<typeof buildAddUserController>>;

beforeEach(() => {
  addUserController = new (buildAddUserController(FakeUseCase))();
});

const requestBody = {
  name: "bob",
  email: "bob@mail.com",
  password: "password123",
  birthDate: new Date("2000-03-12"),
};

test("addUser throws oridinary error", async () => {
  FakeUseCase.mockError(new Error("email is already taken"));
  const response = await addUserController.handle({
    body: requestBody,
  });

  expectStatusCodeToBe(response, 400);
  expectErrorMessageToBe(response, "email is already taken");
});

test("addUser throws ServerError", async () => {
  FakeUseCase.mockError(new ServerError("CRITICAL FAILURE"));
  const response = await addUserController.handle({
    body: requestBody,
  });

  expectStatusCodeToBe(response, 500);
  expectErrorMessageToBe(response, "CRITICAL FAILURE");
});

test("successfully creating a user", async () => {
  FakeUseCase.mockResult({ userId: new NumberId(123) });
  const response = await addUserController.handle({
    body: requestBody,
  });
  expectStatusCodeToBe(response, 201);
  expectDataToMatch(response, { userId: 123 });
});
