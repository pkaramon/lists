import buildAddListItemController from ".";
import { FakeUseCase, NumberId } from "../../fakes";
import FakeIdConverter from "../../fakes/FakeIdConverter";
import { UnknownListItemTypeError } from "../../usecases/addListItem/ListItemFactory";
import ListNotFoundError from "../../usecases/addListItem/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
} from "../__test__/fixtures";

const controller = new (buildAddListItemController({
  AddListItem: FakeUseCase,
  idConverter: new FakeIdConverter(),
}))();
beforeEach(() => {
  FakeUseCase.clear();
});

function getResponse(data: {
  userId?: number;
  listId?: number;
  listItem?: any;
}) {
  const userId = data.userId || 7;
  const listId = data.listId || 1;
  const listItem = data.listItem || { type: "text", title: "hello" };

  return controller.handle({
    body: {
      token: `###${userId}###`,
      listItem,
      listId,
    },
    auth: { userId: new NumberId(userId) },
  });
}

test("list does not exist", async () => {
  FakeUseCase.mockError(new ListNotFoundError());
  const res = await getResponse({});
  expectStatusCodeToBe(res, 404);
  expectErrorMessageToBe(res, "list not found");
});

test("listItem type is unknown", async () => {
  FakeUseCase.mockError(new UnknownListItemTypeError());
  const res = await getResponse({
    listItem: { type: "xxxx", title: "hello" },
  });
  expectStatusCodeToBe(res, 400);
  expectErrorMessageToBe(res, "invalid listItem type");
});

test("user does not have access to the list", async () => {
  FakeUseCase.mockError(new UserNoAccessError());
  const res = await getResponse({ userId: 2 });
  expectStatusCodeToBe(res, 400);
  expectErrorMessageToBe(res, "you have no access to this list");
});

test("adding a list item", async () => {
  FakeUseCase.expectPassedDataToMatch({
    userId: new NumberId(7),
    listId: new NumberId(1),
    listItem: { type: "checkbox", title: "hello", checked: false },
  });

  const res = await getResponse({
    userId: 7,
    listId: 1,
    listItem: { type: "checkbox", title: "hello", checked: false },
  });

  expectStatusCodeToBe(res, 201);
  expectDataToMatch(res, { message: "created a new list item" });
});
