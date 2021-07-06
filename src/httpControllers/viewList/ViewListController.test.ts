import ViewListController from ".";
import { NumberId } from "../../fakes";
import NumberIdConverter from "../../fakes/NumberIdConverter";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
  MockUseCase,
} from "../__test__/fixtures";

const controller = new ViewListController(MockUseCase, new NumberIdConverter());

test("list does not exist", async () => {
  MockUseCase.mockError(new ListNotFoundError());
  const response = await controller.handle({
    body: { listId: "1" },
    auth: { userId: new NumberId(1) },
  });
  expectStatusCodeToBe(response, StatusCode.NotFound);
  expectErrorMessageToBe(response, "list not found");
});

test("list exists but user does not have access to the list", async () => {
  MockUseCase.mockError(new UserNoAccessError());
  const response = await controller.handle({
    body: { listId: "1" },
    auth: { userId: new NumberId(1) },
  });
  expectStatusCodeToBe(response, StatusCode.Unauthorized);
  expectErrorMessageToBe(response, "you do not have access to this list");
});

test("list exists", async () => {
  const useCaseResult = {
    title: "t",
    description: "d",
    length: 2,
    listItems: [{ title: "hello" }, { title: "hello", checked: false }],
  };
  MockUseCase.mockResult(useCaseResult);

  const response = await controller.handle({
    body: { listId: "1" },
    auth: { userId: new NumberId(2) },
  });

  MockUseCase.expectPassedDataToMatch({
    listId: new NumberId(1),
    userId: new NumberId(2),
  });
  expectStatusCodeToBe(response, StatusCode.Ok);
  expectDataToMatch(response, { ...useCaseResult });
});
