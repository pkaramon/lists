import Id from "../model/Id";
import User from "../model/User";

export default interface UserDb {
  save(u: User): Promise<void>;
  getById(id: Id): Promise<User>;
  getByEmail(email: string): Promise<User>;
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = NotFoundError.name;
  }
}

export class DatabaseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = DatabaseError.name;
  }
}
