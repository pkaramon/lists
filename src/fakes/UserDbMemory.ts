import { UserDb } from "../addUser/AddUser";
import Id from "../model/Id";
import User from "../model/User";

export default class UserDbMemory implements UserDb {
  private users = new Map<Id, User>();
  async save(u: User) {
    this.users.set(u.id.toPrimitive(), u);
  }

  async getById(id: Id) {
    const user = this.users.get(id.toPrimitive());
    if (user === undefined) throw new Error("user does not exist");
    return user;
  }

  async getByEmail(email: string) {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (user === undefined) throw new Error("user does not exist");
    return user;
  }
  clear() {
    this.users = new Map();
  }
}
