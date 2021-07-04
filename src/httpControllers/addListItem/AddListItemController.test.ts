import AddListItemController from ".";
import { NumberId } from "../../fakes";
import FakeIdConverter from "../../fakes/FakeIdConverter";
import { UnknownListItemTypeError } from "../../usecases/addListItem/ListItemFactory";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import StatusCode from "../StatusCode";
import  {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
  MockUseCase
} from "../__test__/fixtures";

const controller = new AddListItemController(
  MockUseCase,
  new FakeIdConverter()
);

beforeEach(() => {
  MockUseCase.clear();
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
  MockUseCase.mockError(new ListNotFoundError());
  const res = await getResponse({});
  expectStatusCodeToBe(res, StatusCode.NotFound);
  expectErrorMessageToBe(res, "list not found");
});

test("listItem type is unknown", async () => {
  MockUseCase.mockError(new UnknownListItemTypeError());
  const res = await getResponse({
    listItem: { type: "xxxx", title: "hello" },
  });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "invalid listItem type");
});

test("user does not have access to the list", async () => {
  MockUseCase.mockError(new UserNoAccessError());
  const res = await getResponse({ userId: 2 });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "you have no access to this list");
});

test("adding a list item", async () => {
  const res = await getResponse({
    userId: 7,
    listId: 1,
    listItem: { type: "checkbox", title: "hello", checked: false },
  });

  MockUseCase.expectPassedDataToMatch({
    userId: new NumberId(7),
    listId: new NumberId(1),
    listItem: { type: "checkbox", title: "hello", checked: false },
  });
  expectStatusCodeToBe(res, StatusCode.Created);
  expectDataToMatch(res, { message: "created a new list item" });
});
