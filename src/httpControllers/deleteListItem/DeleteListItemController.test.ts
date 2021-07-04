import DeleteListItemController from ".";
import { NumberId } from "../../fakes";
import FakeIdConverter from "../../fakes/FakeIdConverter";
import InvalidListItemIndexError from "../../usecases/InvalidListItemIndexError";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
  MockUseCase,
} from "../__test__/fixtures";

const request = Object.freeze({
  auth: { userId: new NumberId(2) },
  body: {
    listId: 1,
    listItemIndex: 4,
  },
});

const controller = new DeleteListItemController(
  MockUseCase,
  new FakeIdConverter()
);

beforeEach(() => MockUseCase.clear());

test("list does not exist", async () => {
  MockUseCase.mockError(new ListNotFoundError());
  const res = await controller.handle(request);
  expectStatusCodeToBe(res, StatusCode.NotFound);
  expectErrorMessageToBe(res, "list not found");
});

test("user does not have access to the list", async () => {
  MockUseCase.mockError(new UserNoAccessError());
  const res = await controller.handle(request);
  expectStatusCodeToBe(res, StatusCode.Unauthorized);
  expectErrorMessageToBe(res, "you do not have access to this list");
});

test("listItemIndex is invalid", async () => {
  MockUseCase.mockError(new InvalidListItemIndexError());
  const res = await controller.handle(request);
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "invalid list item index: 4");
});

test("data is correct", async () => {
  MockUseCase.mockResult(undefined);
  const res = await controller.handle(request);
  MockUseCase.expectPassedDataToMatch({
    listId: new NumberId(1),
    userId: new NumberId(2),
    listItemIndex: request.body.listItemIndex,
  });
  expectStatusCodeToBe(res, StatusCode.Ok);
  expectDataToMatch(res, {
    message: "successfully deleted list item at index: 4",
  });
});
