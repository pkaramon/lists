import Id from "../domain/Id";
import HttpRequest from "./HttpRequest";

type AuthHttpRequest<Body> = HttpRequest<Body> & { auth: { userId: Id } };

export default AuthHttpRequest;
