import BcryptHasher from ".";

const saltRounds = 5; // higher - more secure but slower
const hasher = new BcryptHasher(saltRounds);

test("hashing", async () => {
  const password = "pass123";
  const hashed = await hasher.hash(password);
  expect(typeof hashed).toBe("string");
  expect(hashed).not.toBe(password);
  expect(await hasher.compare(password, hashed)).toBe(true);
  expect(await hasher.compare("pass1234", hashed)).toBe(false);
});
