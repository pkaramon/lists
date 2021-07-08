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
    this.checkForExistance(id);
    return this.users.get(id.toPrimitive())!;
  }

  async getByEmail(email: string) {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (user === undefined) throw new NotFoundError("user does not exist");
    return user;
  }

  async deleteById(id: Id): Promise<void> {
    this.checkForExistance(id);
    this.users.delete(id.toPrimitive());
  }

  private checkForExistance(id: Id) {
    const user = this.users.get(id.toPrimitive());
    if (user === undefined) throw new NotFoundError("user does not exist");
  }
}
