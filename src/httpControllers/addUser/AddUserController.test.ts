import NumberId from "../../fakes/NumberId";
import EmailAlreadyTakenError from "../../usecases/addUser/EmailAlreadyTakenError";
import InvalidUserDataError from "../../usecases/addUser/InvalidUserDataError";
import StatusCode from "../StatusCode";
import {
  expectStatusCodeToBe,
  expectErrorMessageToBe,
  expectDataToMatch,
  MockUseCase,
} from "../__test__/fixtures";
import AddUserController from ".";

let addUserController: AddUserController;

beforeEach(() => {
  addUserController = new AddUserController(MockUseCase);
});

const requestBody = {
  name: "bob",
  email: "bob@mail.com",
  password: "password123",
  birthDate: new Date("2000-03-12"),
};

test("addUser throws EmailAlreadyTakenError", async () => {
  MockUseCase.mockError(new EmailAlreadyTakenError());
  const response = await addUserController.handle({
    body: requestBody,
  });

  expectStatusCodeToBe(response, StatusCode.BadRequest);
  expectErrorMessageToBe(response, "email is already taken");
});

test("successfully creating a user", async () => {
  MockUseCase.mockResult({ userId: new NumberId(123) });
  const response = await addUserController.handle({
    body: requestBody,
  });
  expectStatusCodeToBe(response, StatusCode.Created);
  expectDataToMatch(response, { userId: "123" });
});

test("invalid user data", async () => {
  MockUseCase.mockError(
    new InvalidUserDataError("name must contain at least 2 characters")
  );
  const response = await addUserController.handle({
    body: { ...requestBody, name: "a" },
  });
  expectStatusCodeToBe(response, StatusCode.BadRequest);
  expectErrorMessageToBe(response, "name must contain at least 2 characters");
});
