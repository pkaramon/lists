import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import UserDb from "../../dataAccess/UserDb";
import Id from "../../domain/Id";

export default function buildDeleteUser({ userDb }: { userDb: UserDb }) {
  return class DeleteUser {
    constructor(private data: { userId: Id }) {}

    async execute() {
      try {
        await userDb.deleteById(this.data.userId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new Error("user not found");
        else if (e instanceof DatabaseError)
          throw new Error("could not delete the user");
        else throw e;
      }
    }
  };
}
