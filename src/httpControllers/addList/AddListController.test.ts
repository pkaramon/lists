import Clock from "../../domain/Clock";
import User from "../../domain/User";
import {
  FakeClock,
  NumberId,
  UserDbMemory,
  ListDbMemory,
  NumberIdCreator,
} from "../../fakes";
import buildAddList from "../../usecases/addList/AddList";
import {
  expectStatusCodeToBe,
  expectErrorMessageToBe,
  expectDataToMatch,
} from "../__test__/fixtures";
import buildAddListController from "./AddListController";

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
let addListCtrl: InstanceType<ReturnType<typeof buildAddListController>>;
let AddList: ReturnType<typeof buildAddList>;
const userId = new NumberId(1);
beforeEach(async () => {
  const userDb = new UserDbMemory();
  await userDb.save(
    new User({
      id: userId,
      name: "abc",
      email: "bob@mail.com",
      password: "pass123321",
      birthDate: new Date("2000-01-01"),
    })
  );
  AddList = buildAddList({
    userDb,
    listDb: new ListDbMemory(),
    idCreator: new NumberIdCreator(),
  });
  addListCtrl = new (buildAddListController(AddList))();
});

test("invalid list data", async () => {
  const res = await addListCtrl.handle({
    body: { token: "###1###", title: "", description: "" },
    auth: { userId },
  });
  expectStatusCodeToBe(res, 400);
  expectErrorMessageToBe(res, "list title is empty");
});

test("user does not exist", async () => {
  const res = await addListCtrl.handle({
    body: { token: "###100###", title: "", description: "" },
    auth: { userId: new NumberId(100) },
  });
  expectStatusCodeToBe(res, 404);
  expectErrorMessageToBe(res, "user does not exist");
});

test("list data is valid and user exists and it authenticated", async () => {
  const res = await addListCtrl.handle({
    body: { token: "###1###", title: "abc", description: "" },
    auth: { userId },
  });
  expectStatusCodeToBe(res, 201);
  expectDataToMatch(res, { listId: 1 });
});
