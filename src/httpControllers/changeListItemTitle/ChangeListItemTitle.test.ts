import ChangeListItemTitleController from ".";
import { FakeUseCase, NumberId } from "../../fakes";
import FakeIdConverter from "../../fakes/FakeIdConverter";
import InvalidListItemIndexError from "../../usecases/changeListItemTitle/InvalidListItemIndexError";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
} from "../__test__/fixtures";

const controller = new ChangeListItemTitleController(
  FakeUseCase,
  new FakeIdConverter()
);

beforeEach(() => FakeUseCase.clear());

test("list does not exist", async () => {
  FakeUseCase.mockError(new ListNotFoundError());
  const res = await controller.handle({
    body: { token: "###1###", listId: 1, listItemIndex: 0, title: "hello" },
    auth: { userId: new NumberId(1) },
  });
  expectStatusCodeToBe(res, StatusCode.NotFound);
  expectErrorMessageToBe(res, "list not found");
});

test("listItemIndex is invalid", async () => {
  FakeUseCase.mockError(new InvalidListItemIndexError());
  const res = await controller.handle({
    body: { token: "###1###", listId: 1, listItemIndex: -1, title: "hello" },
    auth: { userId: new NumberId(1) },
  });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "invalid list item index: -1");
});

test("user does not have access to the list", async () => {
  FakeUseCase.mockError(new UserNoAccessError());
  const res = await controller.handle({
    body: { token: "###7###", listId: 1, listItemIndex: -1, title: "hello" },
    auth: { userId: new NumberId(7) },
  });
  expectStatusCodeToBe(res, StatusCode.Unauthorized);
  expectErrorMessageToBe(res, "you do not have access to this list");
});

test("all data is valid", async () => {
  FakeUseCase.expectPassedDataToMatch({
    listId: new NumberId(1),
    userId: new NumberId(2),
    listItemIndex: 0,
    title: "hello",
  });
  const res = await controller.handle({
    body: { token: "###2###", listId: 1, listItemIndex: 0, title: "hello" },
    auth: { userId: new NumberId(2) },
  });
  expectStatusCodeToBe(res, StatusCode.Ok);
  expectDataToMatch(res, { message: "successfully changed the title" });
});
