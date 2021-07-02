import NumberId from "../../fakes/NumberId";
import ValidationError from "../ValidationError";
import List from ".";

const validData = {
  id: new NumberId(1),
  authorId: new NumberId(10),
  title: " first title  ",
  description: " abc  ",
};

test("title validation", () => {
  expect(() => new List({ ...validData, title: "" })).toThrowError(
    ValidationError
  );
  expect(() => new List({ ...validData, title: "  " })).toThrowError(
    ValidationError
  );
});

test("valid list data", () => {
  const list = new List(validData);
  expect(list.title).toBe("first title");
  expect(list.description).toBe("abc");
  expect(list.id.equals(new NumberId(1))).toBe(true);
  expect(list.authorId.equals(new NumberId(10))).toBe(true);
});

test("isUserAllowed", () => {
  const list = new List(validData);
  expect(list.isUserAllowed(validData.authorId)).toBe(true);
  expect(list.isUserAllowed(new NumberId(123))).toBe(false);
});
