import ChangeListDetailsController from ".";
import Id from "../../domain/Id";
import { NumberId } from "../../fakes";
import NumberIdConverter from "../../fakes/NumberIdConverter";
import InvalidListDataError from "../../usecases/InvalidListDataError";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
  MockUseCase,
} from "../__test__/fixtures";

const ctrl = new ChangeListDetailsController(
  MockUseCase,
  new NumberIdConverter()
);

beforeEach(() => MockUseCase.clear());

async function getResponse(data: {
  userId: Id;
  listId: string;
  title?: string;
  description?: string;
}) {
  return await ctrl.handle({
    auth: { userId: data.userId },
    body: {
      listId: data.listId,
      listDetails: { title: data.title, description: data.description },
    },
  });
}

test("list does not exist", async () => {
  MockUseCase.mockError(new ListNotFoundError());
  const res = await getResponse({ userId: new NumberId(100), listId: "1" });
  expectStatusCodeToBe(res, StatusCode.NotFound);
  expectErrorMessageToBe(res, "list not found");
});

test("user does not have access", async () => {
  MockUseCase.mockError(new UserNoAccessError());
  const res = await getResponse({ userId: new NumberId(100), listId: "1" });
  expectStatusCodeToBe(res, StatusCode.Unauthorized);
  expectErrorMessageToBe(res, "you have no access to this list");
});

test("invalid list data", async () => {
  MockUseCase.mockError(new InvalidListDataError());
  const res = await getResponse({
    userId: new NumberId(100),
    listId: "1",
  });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "invalid list data");
});

test("changing list details", async () => {
  const res = await getResponse({
    userId: new NumberId(100),
    listId: "1",
    title: "new title",
    description: "new desc",
  });
  MockUseCase.expectPassedDataToMatch({
    userId: new NumberId(100),
    listId: new NumberId(1),
    listDetails: { title: "new title", description: "new desc" },
  });
  expectStatusCodeToBe(res, StatusCode.Ok);
  expectDataToMatch(res, { message: "successfully updated the details" });
});
