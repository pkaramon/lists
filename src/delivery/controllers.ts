import Clock from "../domain/Clock";
import {
  FakeHasher,
  UserDbMemory,
  ListDbMemory,
  NumberIdCreator,
  FakeTokenCreator,
  FakeTokenValidator,
} from "../fakes";
import FakeIdConverter from "../fakes/FakeIdConverter";
import AddListController from "../httpControllers/addList";
import AddListItemController from "../httpControllers/addListItem";
import AddUserController from "../httpControllers/addUser";
import ChangeListItemTitleController from "../httpControllers/changeListItemTitle";
import DeleteListItemController from "../httpControllers/deleteListItem";
import LoginController from "../httpControllers/login";
import buildUserAuthDecorator from "../httpControllers/UserAuthDecorator";
import ObjectValidatorYup from "../httpControllers/validation/ObjectValidatorYup";
import buildRequestBodyValidator from "../httpControllers/validation/RequestBodyValidator/RequestBodyValidator";
import ViewListController from "../httpControllers/viewList";
import buildAddList from "../usecases/addList/AddList";
import buildAddListItem from "../usecases/addListItem/AddListItem";
import ListItemFactoryImp from "../usecases/addListItem/ListItemFactoryImp";
import buildAddUser from "../usecases/addUser/AddUser";
import buildChangeListItemTitle from "../usecases/changeListItemTitle/ChangeListItemTitle";
import buildDeleteListItem from "../usecases/deleteListItem/DeleteListItem";
import buildLogin from "../usecases/login/Login";
import buildViewList from "../usecases/viewList/ViewList";

Clock.inst = {
  now() {
    return new Date();
  },
};
const hasher = new FakeHasher();
const userDb = new UserDbMemory();
const listDb = new ListDbMemory();
const userIdCreator = new NumberIdCreator();
const listIDCreator = new NumberIdCreator();
const idConverter = new FakeIdConverter();
const tokenCreator = new FakeTokenCreator();
const UserAuthDecorator = buildUserAuthDecorator(new FakeTokenValidator());
const RequestBodyValidator = buildRequestBodyValidator(ObjectValidatorYup);

export function setupAddUserController() {
  const AddUser = buildAddUser({
    hasher,
    userDb,
    idCreator: userIdCreator,
  });

  const AddUserControllerClass = RequestBodyValidator(AddUserController);
  const ctrl = new AddUserControllerClass(AddUser);
  return ctrl;
}

export function setupAddListController() {
  const AddList = buildAddList({ userDb, idCreator: listIDCreator, listDb });
  const controller = new (UserAuthDecorator(
    RequestBodyValidator(AddListController)
  ))(AddList);
  return controller;
}

export function setupAddListItemController() {
  const AddListItem = buildAddListItem({
    listDb,
    listItemFactory: new ListItemFactoryImp(),
  });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(AddListItemController)
  );
  return new Controller(AddListItem, idConverter);
}

export function setupDeleteListItemController() {
  const DeleteListItem = buildDeleteListItem({ listDb });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(DeleteListItemController)
  );
  return new Controller(DeleteListItem, idConverter);
}

export function setupChangeListItemTitleController() {
  const ChangeListItemTitle = buildChangeListItemTitle({ listDb });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(ChangeListItemTitleController)
  );
  return new Controller(ChangeListItemTitle, idConverter);
}

export function setupLoginController() {
  const Login = buildLogin({ userDb, hasher, tokenCreator });
  const Controller = RequestBodyValidator(LoginController);
  return new Controller(Login);
}

export function setupViewList() {
  const ViewList = buildViewList({ listDb });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(ViewListController)
  );
  return new Controller(ViewList, idConverter);
}
