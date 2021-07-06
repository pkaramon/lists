import { NumberId } from "../../fakes";
import UUID from "./UUID";
import UUIDConverter from "./UUIDConverter";

const uuid = "ca4d1e65-8146-40f0-8090-73e1cd06d2f3";

test("uuid", () => {
  const id = new UUID(uuid);
  expect(id.equals(new UUID(uuid))).toBe(true);
  expect(id.equals(new UUID(uuid.replace("0", "1")))).toBe(false);
  expect(id.equals(new NumberId(1))).toBe(false);
  expect(id.toPrimitive()).toBe(uuid);
});

test("idConverter", () => {
  const cvt = new UUIDConverter();
  const id = cvt.convert(uuid);
  expect(id.equals(new UUID(uuid)));
});
