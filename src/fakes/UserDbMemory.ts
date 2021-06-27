import Id from "../model/Id";
import User from "../model/User";
import UserDb, { NotFoundError } from "../usecases/UserDb";

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
