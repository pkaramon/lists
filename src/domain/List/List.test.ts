import NumberId from "../../fakes/NumberId";
import ValidationError from "../ValidationError";
import List from ".";
import ListItem from "../ListItem";

const validData = {
  id: new NumberId(1),
  authorId: new NumberId(10),
  title: " first title  ",
  description: " abc  ",
};

class FakeListItem extends ListItem {}

let list: List;
beforeEach(() => {
  list = new List(validData);
});

test("title validation", () => {
  expect(() => new List({ ...validData, title: "" })).toThrowError(
    ValidationError
  );
  expect(() => new List({ ...validData, title: "  " })).toThrowError(
    ValidationError
  );
});

test("valid list data", () => {
  expect(list.title).toBe("first title");
  expect(list.description).toBe("abc");
  expect(list.id.equals(new NumberId(1))).toBe(true);
  expect(list.authorId.equals(new NumberId(10))).toBe(true);
});

test("isUserAllowed", () => {
  expect(list.isUserAllowed(validData.authorId)).toBe(true);
  expect(list.isUserAllowed(new NumberId(123))).toBe(false);
});

test("adding list items", () => {
  list.addListItem(new FakeListItem("title"));
  expect(list.length).toBe(1);
  expect(list.getListItemAt(0).title).toBe("title");
});

test("trying to get/remove list item that does not exist", () => {
  expect(() => list.removeListItemAt(0)).toThrowError(RangeError);
  expect(() => list.getListItemAt(0)).toThrowError(RangeError);
});

test("removing list items", () => {
  list.addListItem(new FakeListItem("1"));
  list.addListItem(new FakeListItem("2"));
  list.addListItem(new FakeListItem("3"));

  list.removeListItemAt(1);

  expect(list.length).toBe(2);
  expect(list.getListItemAt(0).title).toBe("1");
  expect(list.getListItemAt(1).title).toBe("3");
});

test("getting all list items", () => {
  list.addListItem(new FakeListItem("1"));
  list.addListItem(new FakeListItem("2"));

  const listItems = Array.from(list).map((li) => li.title);
  expect(listItems).toEqual(["1", "2"]);
});
