import Clock from "../../domain/Clock";
import User from "../../domain/User";
import FakeClock from "../../fakes/FakeClock";
import FakeTokenValidator from "../../fakes/FakeTokenValidator";
import ListDbMemory from "../../fakes/ListDbMemory";
import NumberId from "../../fakes/NumberId";
import NumberIdCreator from "../../fakes/NumberIdCreator";
import UserDbMemory from "../../fakes/UserDbMemory";
import buildAddList from "../../usecases/addList/AddList";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe
} from "../__test__/fixtures";
import buildAddListController from "./AddListController";

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
let addListCtrl: InstanceType<ReturnType<typeof buildAddListController>>;
let AddList: ReturnType<typeof buildAddList>;
beforeEach(async () => {
  const userDb = new UserDbMemory();
  await userDb.save(
    new User({
      id: new NumberId(1),
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
  addListCtrl = new (buildAddListController({
    AddList,
    tokenValidator: new FakeTokenValidator(),
  }))();
});

test("invalid user token", async () => {
  const res = await addListCtrl.handle({
    body: {
      token: "##1#*$#",
      title: "title",
      description: "desc",
    },
  });
  expectStatusCodeToBe(res, 400);
  expectErrorMessageToBe(res, "auth error");
});

test("invalid list data", async () => {
  const res = await addListCtrl.handle({
    body: {
      token: "###1###",
      title: "",
      description: "",
    },
  });
  expectStatusCodeToBe(res, 400);
  expectErrorMessageToBe(res, "list title is empty");
});

test("user does not exist", async () => {
  const res = await addListCtrl.handle({
    body: { token: "###100###", title: "", description: "" },
  });
  expectStatusCodeToBe(res, 404);
  expectErrorMessageToBe(res, "user does not exist");
});

test("list data is invalid and user exists", async () => {
  const res = await addListCtrl.handle({
    body: { token: "###1###", title: "abc", description: "" },
  });
  expectStatusCodeToBe(res, 201);
  expectDataToMatch(res, { listId: 1 });
});
