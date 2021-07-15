import ListItemGatewayImp from "../domain/ListItemGateway/ListItemGatewayImp";
import AddListController from "../httpControllers/addList";
import AddListItemController from "../httpControllers/addListItem";
import AddUserController from "../httpControllers/addUser";
import ChangeListDetailsController from "../httpControllers/changeListDetails";
import ChangeListItemTitleController from "../httpControllers/changeListItemTitle";
import DeleteListController from "../httpControllers/deleteList";
import DeleteListItemController from "../httpControllers/deleteListItem";
import DeleteUserController from "../httpControllers/deleteUser";
import LoginController from "../httpControllers/login";
import buildUserAuthDecorator from "../httpControllers/UserAuthDecorator";
import ObjectValidatorYup from "../httpControllers/validation/ObjectValidatorYup";
import buildRequestBodyValidator from "../httpControllers/validation/RequestBodyValidator/RequestBodyValidator";
import ViewListController from "../httpControllers/viewList";
import BcryptHasher from "../impl/BcryptHasher";
import JWTokenCreator from "../impl/JWT/JWTokenCreator";
import JWTokenValidator from "../impl/JWT/JWTokenValidator";
import MongoListDb from "../impl/MongoDatabase/MongoListDb";
import MongoUserDb from "../impl/MongoDatabase/MongoUserDb";
import UUIDConverter from "../impl/UUID/UUIDConverter";
import UUIDCreator from "../impl/UUID/UUIDCreator";
import buildAddList from "../usecases/addList";
import buildAddListItem from "../usecases/addListItem";
import buildAddUser from "../usecases/addUser";
import buildChangeListDetails from "../usecases/changeListDetails";
import buildChangeListItemTitle from "../usecases/changeListItemTitle";
import buildDeleteList from "../usecases/deleteList";
import buildDeleteListItem from "../usecases/deleteListItem";
import buildDeleteUser from "../usecases/deleteUser";
import buildLogin from "../usecases/login";
import buildViewList from "../usecases/viewList";

const privateKey = "eed17796-e36d-439b-92b2-da2426d87869";
const hasher = new BcryptHasher(5);
const userIdCreator = new UUIDCreator();
const listICreator = new UUIDCreator();
const idConverter = new UUIDConverter();

const listItemGateway = new ListItemGatewayImp();

const userDb = new MongoUserDb(
  {
    uri: "mongodb://localhost:27017",
    databaseName: "lists",
    collectionName: "users",
  },
  { idConverter }
);
const listDb = new MongoListDb(
  {
    uri: "mongodb://localhost:27017",
    databaseName: "lists",
    collectionName: "lists",
  },
  {
    listItemGateway,
    listIdConverter: idConverter,
    userIdConverter: idConverter,
  }
);

const tokenCreator = new JWTokenCreator(privateKey);
const tokenValidator = new JWTokenValidator(privateKey, idConverter);
const UserAuthDecorator = buildUserAuthDecorator(tokenValidator);
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
  const AddList = buildAddList({ userDb, idCreator: listICreator, listDb });
  const controller = new (UserAuthDecorator(
    RequestBodyValidator(AddListController)
  ))(AddList);
  return controller;
}

export function setupAddListItemController() {
  const AddListItem = buildAddListItem({
    listDb,
    listItemGateway,
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

export function setupViewListController() {
  const ViewList = buildViewList({ listDb, listItemGateway });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(ViewListController)
  );
  return new Controller(ViewList, idConverter);
}

export function setupChangeListDetailsController() {
  const ChangeListDetails = buildChangeListDetails({ listDb });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(ChangeListDetailsController)
  );
  return new Controller(ChangeListDetails, idConverter);
}

export function setupDeleteUserController() {
  const DeleteUser = buildDeleteUser({ userDb });
  const Controller = UserAuthDecorator(DeleteUserController);
  return new Controller(DeleteUser);
}

export function setupDeleteListController() {
  const DeleteList = buildDeleteList({ listDb });
  const Controller = UserAuthDecorator(
    RequestBodyValidator(DeleteListController)
  );
  return new Controller(DeleteList, idConverter);
}
