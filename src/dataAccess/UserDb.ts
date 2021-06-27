import Id from "../domain/Id";
import User from "../domain/User";

export default interface UserDb {
  save(u: User): Promise<void>;
  getById(id: Id): Promise<User>;
  getByEmail(email: string): Promise<User>;
}
