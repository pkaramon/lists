import buildGetLists from ".";
import DatabaseError from "../../dataAccess/DatabaseError";
import ListDb from "../../dataAccess/ListDb";
import List from "../../domain/List";
import { ListDbMemory, NumberId } from "../../fakes";
import ServerError from "../ServerError";

let GetLists: ReturnType<typeof buildGetLists>;
let listDb: ListDb;
beforeEach(async () => {
  listDb = new ListDbMemory();
  await listDb.save(
    new List({
      id: new NumberId(1),
      title: "first",
      description: "",
      authorId: new NumberId(100),
    })
  );
  await listDb.save(
    new List({
      id: new NumberId(2),
      title: "second",
      description: "",
      authorId: new NumberId(100),
    })
  );
  GetLists = buildGetLists({ listDb });
});

test("user does not have any lists", async () => {
  const res = await new GetLists({ userId: new NumberId(123) }).execute();
  expect(res.lists).toEqual([]);
});

test("user has lists", async () => {
  const res = await new GetLists({ userId: new NumberId(100) }).execute();
  expect(res.lists).toEqual([
    { id: new NumberId(1), title: "first", description: "" },
    { id: new NumberId(2), title: "second", description: "" },
  ]);
});

test("db error", async () => {
  listDb.getListsMadeBy = () => {
    throw new DatabaseError();
  };
  const fn = () => new GetLists({ userId: new NumberId(100) }).execute();
  await expect(fn).rejects.toThrowError(ServerError);
});
