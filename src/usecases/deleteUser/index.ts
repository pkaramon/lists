import NotFoundError from "../../dataAccess/NotFoundError";
import UserDb from "../../dataAccess/UserDb";
import Id from "../../domain/Id";
import UserNotFoundError from "../addList/UserNotFoundError";
import ServerError from "../ServerError";

export default function buildDeleteUser({ userDb }: { userDb: UserDb }) {
  return class DeleteUser {
    constructor(private data: { userId: Id }) {}

    async execute() {
      try {
        await userDb.deleteById(this.data.userId);
      } catch (e) {
        if (e instanceof NotFoundError) throw new UserNotFoundError();
        else throw new ServerError("could not delete the user");
      }
    }
  };
}
