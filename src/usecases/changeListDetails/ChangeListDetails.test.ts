import buildChangeListDetails from ".";
import ListDb from "../../dataAccess/ListDb";
import Id from "../../domain/Id";
import List from "../../domain/List";
import { ListDbMemory, NumberId } from "../../fakes";
import InvalidListDataError from "../InvalidListDataError";
import ListNotFoundError from "../ListNotFoundError";
import UserNoAccessError from "../UserNoAccessError";

let ChangeListDetails: ReturnType<typeof buildChangeListDetails>;
let listDb: ListDb;
beforeEach(async () => {
  listDb = new ListDbMemory();
  await listDb.save(
    new List({
      id: new NumberId(1),
      authorId: new NumberId(100),
      title: "title",
      description: "desc",
    })
  );
  ChangeListDetails = buildChangeListDetails({ listDb });
});

async function expectChangeListDetailsToThrowError(
  data: {
    userId: Id;
    listId: Id;
    listDetails?: { title?: string; description?: string };
  },
  error: any
) {
  await expect(() =>
    new ChangeListDetails({
      ...data,
      listDetails: data.listDetails ?? {},
    }).execute()
  ).rejects.toThrowError(error);
}

test("list does not exist", async () => {
  await expectChangeListDetailsToThrowError(
    { userId: new NumberId(100), listId: new NumberId(1234) },
    ListNotFoundError
  );
});

test("user does not have access", async () => {
  await expectChangeListDetailsToThrowError(
    { userId: new NumberId(1234), listId: new NumberId(1) },
    UserNoAccessError
  );
});

async function changeListDetails(data: {
  title?: string;
  description?: string;
}) {
  await new ChangeListDetails({
    userId: new NumberId(100),
    listId: new NumberId(1),
    listDetails: data,
  }).execute();
}

test("changing title", async () => {
  await changeListDetails({ title: "new title" });
  const list = await listDb.getById(new NumberId(1));
  expect(list.title).toBe("new title");
  expect(list.description).toBe("desc");
});

test("chaging description", async () => {
  await changeListDetails({ description: "new desc" });
  const list = await listDb.getById(new NumberId(1));
  expect(list.title).toBe("title");
  expect(list.description).toBe("new desc");
});

test("validation of data", async () => {
  await expectChangeListDetailsToThrowError(
    {
      listId: new NumberId(1),
      userId: new NumberId(100),
      listDetails: { title: "  " },
    },
    InvalidListDataError
  );
});
