import buildDeleteList from ".";
import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import { ListDbMemory, NumberId } from "../../fakes";
import ListNotFoundError from "../ListNotFoundError";
import ServerError from "../ServerError";
import UserNoAccessError from "../UserNoAccessError";

let listDb = new ListDbMemory();
let DeleteList: ReturnType<typeof buildDeleteList>;
beforeEach(async () => {
  listDb = new ListDbMemory();
  const list = new List({
    id: new NumberId(1),
    title: "t",
    description: "d",
    authorId: new NumberId(100),
  });
  await listDb.save(list);
  DeleteList = buildDeleteList({ listDb });
});

async function expectDeleteListToThrow(
  data: { userId: Id; listId: Id },
  error: any
) {
  await expect(() => new DeleteList(data).execute()).rejects.toThrowError(
    error
  );
}

test("list does not exist", async () => {
  await expectDeleteListToThrow(
    { listId: new NumberId(1234), userId: new NumberId(100) },
    ListNotFoundError
  );
});

test("user does not have access to the list", async () => {
  await expectDeleteListToThrow(
    { listId: new NumberId(1), userId: new NumberId(1234) },
    UserNoAccessError
  );
});

test("delete list from db", async () => {
  await new DeleteList({
    listId: new NumberId(1),
    userId: new NumberId(100),
  }).execute();

  await expect(() => listDb.getById(new NumberId(1))).rejects.toThrowError(
    NotFoundError
  );
});

test("database error", async () => {
  const throwDbError = async () => {
    throw new DatabaseError();
  };
  listDb.deleteById = throwDbError;
  await expectDeleteListToThrow(
    { listId: new NumberId(1), userId: new NumberId(100) },
    ServerError
  );
});
