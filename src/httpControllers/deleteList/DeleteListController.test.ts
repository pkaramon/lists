import DeleteListController from ".";
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

const ctrl = new DeleteListController(MockUseCase, new NumberIdConverter());

test("list does not exist", async () => {
  MockUseCase.mockError(new ListNotFoundError());
  const res = await ctrl.handle({
    body: { listId: "1" },
    auth: { userId: new NumberId(1) },
  });
  expectStatusCodeToBe(res, StatusCode.NotFound);
  expectErrorMessageToBe(res, "list not found");
});

test("user does not have access to the list", async () => {
  MockUseCase.mockError(new UserNoAccessError());
  const res = await ctrl.handle({
    body: { listId: "1" },
    auth: { userId: new NumberId(1) },
  });
  expectStatusCodeToBe(res, StatusCode.Unauthorized);
  expectErrorMessageToBe(res, "you have no access to this list");
});

test("deleting the list", async () => {
  MockUseCase.mockResult(Promise.resolve());
  const res = await ctrl.handle({
    body: { listId: "1" },
    auth: { userId: new NumberId(1) },
  });
  MockUseCase.expectPassedDataToMatch({
    userId: new NumberId(1),
    listId: new NumberId(1),
  });

  expectStatusCodeToBe(res, 200);
  expectDataToMatch(res, { message: "successfully deleted the list" });
});
