import NotFoundError from "../dataAccess/NotFoundError";
import UserDb from "../dataAccess/UserDb";
import Id from "../domain/Id";
import User from "../domain/User";

export default class UserDbMemory implements UserDb {
  private users = new Map<string | number, User>();

  async save(u: User) {
    this.users.set(u.id.toPrimitive(), u);
  }

  async getById(id: Id) {
    const user = this.users.get(id.toPrimitive());
    if (user === undefined) throw new NotFoundError("user does not exist");
    return user;
  }

  async getByEmail(email: string) {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (user === undefined) throw new NotFoundError("user does not exist");
    return user;
  }

  clear() {
    this.users = new Map();
  }
}
